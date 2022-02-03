import { ByteReader } from '@stablelib/bytereader';
import { ByteWriter } from '@stablelib/bytewriter';
import { serializer, security } from '../helper';
import sha from '@stablelib/sha256';
import chacha from '@stablelib/chacha';
import { concat } from '@stablelib/bytes';
import ed25519 from '@stablelib/ed25519';

/**
 * Packet flags. uint8
 */
enum PacketFlag {
  None = 0,
  WithSignature = 1 << 0,
  WithPrevMessageId = 1 << 1,
  WithSenderKey = 1 << 2,
  WithSenderId = 1 << 3,
  WithReceiverId = 1 << 4,
  WithTimestamp = 1 << 5,
  WithEncryption = 1 << 6,
  WithSalt = 1 << 7,
}

/**
 * Packet type. uint8
 */
enum PacketType {
  RAW = 0,
  STATUS = 1,
  MESSAGE = 2,
  IDENTIFY = 3,
  REGISTER = 4,
  RESOLVE = 5,
  //INVITE = 6,
  //JOIN = 7,
  //WELCOME = 8,
  LEAVE = 9,
  KICK = 10,
}

/**
 * The universal serializable Plabble Protocol Packet
 * [[4]  [2]    [1]  [1]]   [64?]     [ [4?]     [32?]     [20?]     [20?]     [4?]   [12?] [16?]] variable ]
 * Size Version Flag Type  Signature PrevMsgId SenderKey SenderId ReceiverId Timestamp Nonce Salt  Payload
 */
export class PlabblePacket {
  /**
   * Plabble protocol version
   */
  public version: number;

  /**
   * Packet flag(s)
   */
  public flag: PacketFlag;

  /**
   * The packet type
   */
  public type: PacketType;

  /**
   * The signature of the packet. Can be set using the sign() method
   */
  public signature?: Uint8Array;

  /**
   * The id of the previous message (uint32)
   */
  public prevMsgId?: number;

  /**
   * Get the packet ID. Equals the previous message id + 1
   * @returns The packetId or undefined if prevMsgId is not set
   */
  public get id(): number | undefined {
    return this.prevMsgId !== undefined ? this.prevMsgId + 1 : undefined;
  }

  /**
   * Get the senderId
   * @returns The _senderId field or calculated from the sender key
   */
  public get senderId(): Uint8Array {
    return this._senderId === undefined ? sha.hash(this.senderKey).slice(0,20) : this._senderId;
  }

  /**
   * Set sender id
   */
  public set senderId(id: Uint8Array) {
    this._senderId = id;
  }

  /**
   * Calculate the size of the packet
   * @returns The exact serialized size of the packet
   */
  public get size(): number {
    return (
      4 +
        2 +
        1 +
        1 +
        ((this.flag & PacketFlag.WithSignature) !== 0 ? 64 : 0) +
        ((this.flag & PacketFlag.WithPrevMessageId) !== 0 ? 4 : 0) +
        ((this.flag & PacketFlag.WithSenderKey) !== 0 ? 32 : 0) +
        ((this.flag & PacketFlag.WithSenderId) !== 0 ? 20 : 0) +
        ((this.flag & PacketFlag.WithReceiverId) !== 0 ? 20 : 0) +
        ((this.flag & PacketFlag.WithTimestamp) !== 0 ? 4 : 0) +
        ((this.flag & PacketFlag.WithEncryption) !== 0 ? 12 : 0) +
        ((this.flag & PacketFlag.WithSalt) !== 0 ? 16 : 0) +
        this.payload?.length ?? 0
    );
  }

  /**
   * The public key of the sender (optional)
   */
  public senderKey?: Uint8Array;

  /**
   * The identifier of the sender (optional, not needed if senderKey is set). Can be set using the sign(key, true) or with the setter of senderId
   */
  private _senderId?: Uint8Array;

  /**
   * The identifier of the receiver (optional)
   */
  public receiverId?: Uint8Array;

  /**
   * The moment the packet is sent
   */
  public timestamp?: Date;

  /**
   * The encryption nonce. Will be set with the encrypt() method and consumed with the decrypt() method
   */
  private nonce?: Uint8Array;

  /**
   * The key salt. Can be omitted if no encryption is used or ratchetId is used
   */
  public salt?: Uint8Array;

  /**
   * The payload of the packet
   */
  protected payload?: Uint8Array;

  /**
   * Serialize the packet to byte array
   * @returns The serialized packet
   */
  public serialize(): Uint8Array {
    //Auto-set flags
    if (this._senderId !== undefined) this.flag |= PacketFlag.WithSenderId;
    if (this.receiverId !== undefined) this.flag |= PacketFlag.WithReceiverId;
    if (this.timestamp !== undefined) this.flag |= PacketFlag.WithTimestamp;
    if (this.prevMsgId !== undefined) this.flag |= PacketFlag.WithPrevMessageId;

    const size = this.size;
    let writer = new ByteWriter(size);

    //Static header fields
    writer.writeUint32LE(size); //TODO: decide if size is added here (size is OMITTED when deserializing! )
    writer.writeUint16LE(this.version);
    writer.writeByte(this.flag);
    writer.writeByte(this.type);

    //Variable header fields
    if ((this.flag & PacketFlag.WithSignature) !== 0) writer.write(this.signature);
    if ((this.flag & PacketFlag.WithPrevMessageId) !== 0) writer.writeUint32LE(this.prevMsgId);
    if ((this.flag & PacketFlag.WithSenderKey) !== 0) writer.write(this.senderKey);
    if ((this.flag & PacketFlag.WithSenderId) !== 0) writer.write(this.senderId);
    if ((this.flag & PacketFlag.WithReceiverId) !== 0) writer.write(this.receiverId);
    if ((this.flag & PacketFlag.WithTimestamp) !== 0) writer.write(serializer.fromDate(this.timestamp));
    if ((this.flag & PacketFlag.WithEncryption) !== 0) writer.write(this.nonce);
    if ((this.flag & PacketFlag.WithSalt) !== 0) writer.write(this.salt);

    //Payload
    if (this.payload !== undefined) {
      writer.write(this.payload);
    }

    return writer.finish();
  }

  /**
   * Deserialize packet from byte array
   * @param serialized The serialized packet
   */
  private deserialize(serialized: Uint8Array) {
    let reader = new ByteReader(serialized);

    //Static header fields
    this.version = reader.readUint16LE();
    this.flag = reader.readByte();
    this.type = reader.readByte();

    //Dynamic header field
    if ((this.flag & PacketFlag.WithSignature) !== 0) this.signature = reader.read(64);
    if ((this.flag & PacketFlag.WithPrevMessageId) !== 0) this.prevMsgId = reader.readUint32LE();
    if ((this.flag & PacketFlag.WithSenderKey) !== 0) this.senderKey = reader.read(32);
    if ((this.flag & PacketFlag.WithSenderId) !== 0) this.senderId = reader.read(20);
    if ((this.flag & PacketFlag.WithReceiverId) !== 0) this.receiverId = reader.read(20);
    if ((this.flag & PacketFlag.WithTimestamp) !== 0) this.timestamp = serializer.toDate(reader.read(4));
    if ((this.flag & PacketFlag.WithEncryption) !== 0) this.nonce = reader.read(12);
    if ((this.flag & PacketFlag.WithSalt) !== 0) this.salt = reader.read(16);

    //Payload
    this.payload = reader.read(reader.unreadLength);
  }

  /**
   * Encrypt the packet payload using a secret key
   * @param secretKey The key to use
   */
  public encrypt(secretKey: Uint8Array) {
    if ((this.flag & PacketFlag.WithEncryption) !== 0) throw new Error('Packet is already encrypted');

    if (this.payload === undefined) {
      throw new Error('No payload present');
    }

    const nonce = security.randomBytes(12);
    chacha.streamXOR(secretKey, nonce, this.payload, this.payload); //src = destination
    this.nonce = nonce;
    this.flag |= PacketFlag.WithEncryption;
  }

  /**
   * Decrypt the packet using the secretKey
   * @param secretKey The secret key
   */
  public decrypt(secretKey: Uint8Array) {
    if ((this.flag & PacketFlag.WithEncryption) === 0) throw new Error('Packet is not encrypted');

    if (this.payload === undefined) {
      throw new Error('No payload present');
    }

    chacha.streamXOR(secretKey, this.nonce, this.payload, this.payload); //src = destination
    this.flag &= ~PacketFlag.WithEncryption;
    this.nonce = undefined;
  }

  /**
   * Get a slice of the data in the packet that must be signed/verified
   * @returns Data to sign/verify
   */
  private getSignatureData(): Uint8Array {
    //If signature is not set we expect that the user is signing
    if ((this.flag & PacketFlag.WithSignature) === 0) {
      this.flag |= PacketFlag.WithSignature;
    }

    const serialized = this.serialize();
    const staticHeaderFields = serialized.slice(4, 8);
    const dynamicHeaderFieldsAndPayload = serialized.slice(72);
    return concat(staticHeaderFields, dynamicHeaderFieldsAndPayload);
  }

  /**
   * Sign the packet using the privateKey
   * @param privateKey The private key to sign the data with
   * @param setSenderId If set to true, senderId will be automatically set (derived from the private key)
   */
  public sign(privateKey: Uint8Array, setSenderId: boolean = false) {
    if (setSenderId) {
      this.flag |= PacketFlag.WithSenderId;
      this.senderId = sha.hash(ed25519.extractPublicKeyFromSecretKey(privateKey)).slice(0, 20);
    }

    var dataToSign = this.getSignatureData();
    this.signature = ed25519.sign(privateKey, dataToSign);
  }

  /**
   * Verify the packet
   * @param publicKey The public key to verify the packet with, can be omitted if senderKey is present
   * @returns True if the combination of the key and signature is valid
   */
  public verify(publicKey?: Uint8Array): boolean {
    //If public key not given, check if packet contains "senderKey"
    if (publicKey === undefined) {
      if ((this.flag & PacketFlag.WithSenderKey) === 0)
        throw new Error('No public key provided and no public key present in packet');

      publicKey = this.senderKey;
    }

    if ((this.flag & PacketFlag.WithSignature) === 0) throw new Error('No signature present on this packet');

    //If senderId present, check author
    if ((this.flag & PacketFlag.WithSenderId) !== 0) {
      const authorId = sha.hash(publicKey).slice(0, 20);
      if (!serializer.equal(this.senderId, authorId))
        throw new Error("Provided public key doesn't match author key. Please provide author key.");
    }

    var dataToVerify = this.getSignatureData();
    return ed25519.verify(publicKey, dataToVerify, this.signature);
  }
}
