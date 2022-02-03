import { ByteReader } from '@stablelib/bytereader';
import { ByteWriter } from '@stablelib/bytewriter';

export class KeyUpdate {
  /**
   * The identifier of the user in the tree, can also be used for replacing key update
   */
  public identifier?: Uint8Array; //identifier NOT NEEDED in transport if not replacing-key-update
  
  /**
   * The index of the node to be replaced (if replacing key update)
   */
  public replaceLeafIndex?: number;

  constructor(public keys: Uint8Array[]) {}

  /**
   * Serialize keyUpdate to byte array
   * @returns The serialized update
   */
  public serialize(): Uint8Array {
    const size =
      this.keys.length * 32 + (this.identifier !== undefined ? 20 : 0) + (this.replaceLeafIndex !== undefined ? 2 : 0);
    let writer = new ByteWriter(size);
    if (this.identifier !== undefined) {
      writer.write(this.identifier);
    }

    if (this.replaceLeafIndex !== undefined) {
      writer.writeUint16LE(this.replaceLeafIndex);
    }

    this.keys.forEach(k => {
      writer.write(k);
    });

    return writer.finish();
  }

  /**
   * Deserialize keyUpdate
   * @param serialized The serialized key update
   */
  private deserialize(serialized: Uint8Array) {
    const size = serialized.length;
    let reader = new ByteReader(serialized);
    if (size % 32 === 2) {
      this.replaceLeafIndex = reader.readUint16LE();
    } else if (size % 32 === 20) {
      this.identifier = reader.read(20);
    }

    this.keys = [];
    while (reader.unreadLength >= 32) {
      this.keys.push(reader.read(32));
    }
  }
}
