import { serializer } from '../helper';

import x25519 from '@stablelib/x25519';
import { SHA256 } from '@stablelib/sha256';
import { HKDF } from '@stablelib/hkdf';
import { ByteWriter } from '@stablelib/bytewriter';
import { ByteReader } from '@stablelib/bytereader';
import { KeyUpdate } from './keyUpdate';

//pub, priv
type KeyPair = [pub: Uint8Array, priv: Uint8Array | null];

/**
 * Node in the tree
 */
export class DhNode {
  public id?: Uint8Array;
  public keypair: KeyPair;
  public lastUpdate?: Date;

  constructor(keypair: KeyPair, id?: Uint8Array, lastUpdate?: Date) {
    this.id = id;
    this.keypair = keypair;
    this.lastUpdate = lastUpdate;
  }

  /**
   * Check if node is garbage/expired
   * @param expirationInterval The max amount of time before the node expires
   * @returns True if the node is expired, else false
   */
  public expired(expirationInterval: number): boolean {
    if (this.lastUpdate === undefined) return false;
    const diff = new Date().getTime() - this.lastUpdate.getTime();
    return diff < expirationInterval;
  }
}

/**
 * The group Diffie-Hellman tree
 */
export class DhTree {
  public nodes: DhNode[];
  private treeSecret?: Uint8Array;
  public keyExpirationInterval: number = 10 * 24 * 60 * 60 * 1000; //10 days

  constructor() {
    this.nodes = [];
  }

  /**
   * Get depth of the tree
   * @returns The depth of the tree
   */
  public get depth(): number {
    return Math.floor(Math.log2(this.nodes.length)) + 1;
  }

  /**
   * Get the amount of leaves
   * @returns The number of leaves
   */
  public get leafCount(): number {
    return Math.floor(this.nodes.length / 2) + (this.nodes.length % 2);
  }

  /**
   * Calculate secret of the tree
   * @param ratchetOrSalt The ratchetId of the latest message or its salt
   * @returns The tree secret
   */
  public secret(ratchetOrSalt?: Uint8Array): Uint8Array {
    if (this.treeSecret === undefined) this.treeSecret = this.getSharedSecretOfNodeAt(1);

    const kdf = new HKDF(SHA256, this.treeSecret, ratchetOrSalt);
    return kdf.expand(32);
  }

  /**
   * Get the leaves (slice of the nodes)
   * @returns The leaves of the tree
   */
  public leaves(): DhNode[] {
    return this.nodes.slice(this.nodes.length - this.leafCount);
  }

  /**
   * Get index of node by its identifier
   * @param identifier The user identifier (20-byte hash)
   * @returns The index in the tree
   */
  public indexOf(identifier: Uint8Array): number {
    return this.indexFromLeafIndex(this.leafIndexOf(identifier));
  }

  /**
   * Indicates if tree contains a node by its id
   * @param identifier The user identifier (20-byte hash)
   * @returns True if node is present in tree
   */
  public contains(identifier: Uint8Array): boolean {
    return this.leaves().some(x => serializer.equal(x.id, identifier));
  }

  /**
   * Get leaf index of node by identifier
   * @param identifier The user identifier (20-byte hash)
   * @returns The leaf-index
   */
  public leafIndexOf(identifier: Uint8Array): number {
    return this.leaves().findIndex(x => serializer.equal(x.id, identifier));
  }

  /**
   * Convert leaf-index to tree-index
   * @param idx The leaf index
   * @returns The tree index
   */
  private indexFromLeafIndex(idx: number): number {
    return idx + (this.nodes.length - this.leafCount);
  }

  /**
   * Get index of parent node
   * @param idx The index of the node
   * @returns The index of the parent of the node
   */
  private parent(idx: number): number {
    return idx === 0 ? 0 : Math.floor((idx - 1) / 2);
  }

  /**
   * Get index of sibling node
   * @param idx The index of the node
   * @returns The index of the sibling of the node
   */
  private sibling(idx: number): number {
    if ((idx & 1) === 1) {
      if (idx >= this.nodes.length) return idx;
      return idx + 1;
    } else {
      if (idx === 0) return idx;
      return idx - 1;
    }
  }

  /**
   * Get index of user in tree
   * @returns The index of the leaf-node with a private key, which should be the user itself
   */
  private get selfIndex(): number {
    return this.indexFromLeafIndex(this.leaves().findIndex(x => x.keypair[1] !== undefined));
  }

  /**
   * Scan the tree for garbage nodes and return the leaf-indices of the garbage nodes
   */
  private scan(): number[] {
    let indices = [];
    const leaves = this.leaves();
    for (let i = 0; i < leaves.length; i++) {
      if (leaves[i].expired(this.keyExpirationInterval)) {
        indices.push(i);
      }
    }

    return indices;
  }

  /**
   * alculates secret of node and it's sibling
   * @param idx The node's index
   * @returns Shared secret between node at 'idx' and its sibling
   */
  private getSharedSecretOfNodeAt(idx: number): Uint8Array {
    const sibIdx = this.sibling(idx);

    //Check both sides
    const iHas = this.nodes[idx].keypair[1] !== undefined;

    if (!iHas && this.nodes[sibIdx].keypair[1] === undefined) throw new Error('Private key is undefined, cant do ECDH');

    const sharedSecret = x25519.sharedKey(
      this.nodes[iHas ? idx : sibIdx].keypair[1],
      this.nodes[iHas ? sibIdx : idx].keypair[0]
    );
    return sharedSecret;
  }

  /**
   * Recalculate key pairs in tree from index
   * @param idx The index to recalculate the key pairs from
   */
  private update(idx: number) {
    let parentIdx = this.parent(idx);

    while (parentIdx != 0) {
      const shared = this.getSharedSecretOfNodeAt(idx);
      const kdf = new HKDF(SHA256, shared, undefined, undefined);
      const privKey = kdf.expand(32);
      const pubKey = x25519.scalarMultBase(privKey);

      this.nodes[parentIdx] = new DhNode([pubKey, privKey]);

      idx = parentIdx;
      parentIdx = this.parent(parentIdx);
    }

    if (this.nodes.length > 1) this.treeSecret = this.getSharedSecretOfNodeAt(1);
  }

  /**
   * Insert new/update node in tree
   * @param key The node's keypair to set
   * @param identifier The node's identifier (often public identity key hash)
   * @param update (ndicates if the tree must be updated afterwards
   * @param replaceIndex The index of the node to replace to set instead of add
   */
  private internalPut(
    key: KeyPair,
    identifier: Uint8Array,
    update: boolean = true,
    replaceIndex: number | undefined = undefined
  ) {
    if (this.contains(identifier)) {
      //Update node in tree
      const idx = this.indexOf(identifier);
      this.nodes[idx].keypair = key;
      this.nodes[idx].lastUpdate = new Date();
      if (update) this.update(idx);
      return;
    }

    //If replaceIndex is set, replace node. Else check for garbage
    if (replaceIndex !== undefined) {
      var idx = this.indexFromLeafIndex(replaceIndex);
      this.nodes[idx] = new DhNode(key, identifier, new Date());

      if (update) this.update(idx);
      return;
    }

    const scan = this.scan();
    if (scan.length > 0) {
      //If garbage node found, replace the first one IF not at the end of the tree
      var idx = scan[0];
      if (idx < this.leafCount - 1) {
        this.internalPut(key, identifier, update, idx);
        return;
      }
    }

    //Else: insert
    var len = this.nodes.length;
    this.nodes.push(new DhNode(key, identifier, new Date()));

    if (len > 0) {
      var parentIdx = this.parent(len);
      var parent = this.nodes[parentIdx];
      this.nodes.push(parent);
      if (update) this.update(this.nodes.length - 1);
    }
  }

  /**
   * Insert or update a node in the tree
   * @param key The node's keypair to set
   * @param identifier The node's identifier
   * @param replaceIndex LeafIndex of node to replace, optional, enter to perform replaceUpdate
   */
  public put(key: KeyPair, identifier: Uint8Array, replaceIndex?: number) {
    this.internalPut(key, identifier, true, replaceIndex);
  }

  /**
   * Serialize tree into public copy
   * @returns The serialized DH-Tree
   */
  public serialize(): Uint8Array {
    let writer = new ByteWriter();
    writer.writeUint16LE(this.leafCount);
    this.leaves().forEach(l => {
      writer.write(l.id);
      writer.write(l.keypair[0]);
      writer.write(serializer.fromDate(l.lastUpdate));
    });

    this.nodes.slice(1, this.nodes.length - this.leafCount - 1).forEach(n => {
      writer.write(n.keypair[0]);
    });

    return writer.finish();
  }

  /**
   * Deserialize public tree copy
   * @param serialized The serialized tree
   */
  private deserialize(serialized: Uint8Array) {
    let reader = new ByteReader(serialized);
    this.nodes = [];
    let leaves = [];
    let leafCount = reader.readUint16LE();
    for (let i = 0; i < leafCount; i++) {
      const id = reader.read(20);
      const pubKey = reader.read(32);
      const ts = serializer.toDate(reader.read(4));
      leaves.push(new DhNode([pubKey, null], id, ts));
    }

    this.nodes.push(new DhNode(undefined));
    while (reader.unreadLength >= 32) {
      this.nodes.push(new DhNode([reader.read(32), null]));
    }

    this.nodes.push(...leaves);
  }

  /**
   * Create key update
   * @param identifier The identifier of the updated node
   * @returns A KeyUpdate with the updated public keys
   */
  public createUpdate(identifier?: Uint8Array): KeyUpdate {
    let keys = [];
    let idx = identifier !== undefined ? this.indexOf(identifier) : this.selfIndex;
    while (idx !== 0) {
      keys.push(this.nodes[idx].keypair[0].slice());
      idx = this.parent(idx);
    }

    let update = new KeyUpdate(keys);
    update.identifier = identifier;
    return update;
  }

  /**
   * Apply keyUpdate to tree
   * @param update The update to apply
   */
  public applyUpdate(update: KeyUpdate) {
    if (update.keys.length === 0) return;

    const once = this.leafCount == 1 && update.keys.length == 1;
    let keys = update.keys.reverse();
    const id = update.identifier ?? this.leaves[update.replaceLeafIndex];

    this.internalPut([keys.pop(), null], id, once, update.replaceLeafIndex);

    if (keys.length > 0) {
      let idx = this.parent(this.indexOf(id));
      while (idx != 0) {
        this.nodes[idx] = new DhNode([keys.pop(), null]);

        idx = this.parent(idx);
      }
    }

    this.update(this.selfIndex);
  }
}
