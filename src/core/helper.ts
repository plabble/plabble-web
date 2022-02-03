const MAX_BYTES = 65536;
const MAX_UINT32 = 4294967295;
const EPOCH = 1577836800; //2020-01-01T00:00:00

export const serializer = {
  fromBase64(base64: string): Uint8Array {
    //atob is a browser function for converting base64 to byte string
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  },
  toBase64(bytes: Uint8Array): string {
    //btoa is a browser function for converting byte string to base64
    return btoa(String.fromCharCode(...bytes));
  },
  toHex(bytes: Uint8Array): string {
    return [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
  },
  
  /***
   * Convert date to Plabble timestamp bytes
   */
  fromDate(date: Date): Uint8Array {
    const ts = parseInt((date.getTime() / 1000).toFixed(0)) - EPOCH;
    const buff = new ArrayBuffer(4);
    new DataView(buff).setUint32(0, ts);
    return new Uint8Array(buff);
  },

  /**
   * Convert Plabble timestamp bytes to timestamp
   */
  toDate(bytes: Uint8Array): Date {
    const nr = new DataView(bytes.buffer).getUint32(0);
    return new Date((nr + EPOCH) * 1000);
  },

  /**
   * Check if two byte arrays are equal
   * @param one The first array
   * @param other The second array
   * @returns True if two arrays are identical
   */
  equal(one: Uint8Array | undefined, other: Uint8Array | undefined): boolean {
    if (one === undefined && other === undefined) return true;
    if (one === undefined || other === undefined) return false;
    if (one.length !== other.length) return false;
    for (let i = 0; i < one.length; i++) {
      if (one[i] != other[i]) return false;
    }
    return true;
  },
  
  /*
  getFlagCount(flag: number): number {
    let cnt = 0;
    for (let i = 7; i >= 0; i--) cnt += (flag >> i) & 1;
    return cnt;
  },
  getFlags(flag: number): number[] {
    const types: number[] = [];
    for (let i = 0; i <= 8; i++) {
      const f = 1 << i;
      if ((flag & f) == f) types.push(f);
    }
    return types;
  },
  isBitSet(nr: number, pos: number): boolean {
    return (nr & (1 << pos)) != 0;
  },
  */

  /**
   * Get UTF-8 bytes from string
   * @param str The string to encode
   * @returns The string bytes
   */
  fromString(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  },

  /**
   * Decode bytes into UTF-8 string
   * @param bytes The bytes to decode into string
   * @returns The decoded string
   */
  toString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  },
};

export const security = {
  /**
   * Get cryptographically random bytes
   * @param size The amount of bytes to get
   * @returns Byte array with the requested amount of random bytes
   */
  randomBytes(size: number): Uint8Array {
    if (size > MAX_UINT32) throw new RangeError('Requested more than maximum amount of bytes');
    const bytes = new Uint8Array(size);

    if (size > 0) {
      if (size > MAX_BYTES) {
        for (let i = 0; i < size; i += MAX_BYTES) {
          crypto.getRandomValues(bytes.slice(i, i + MAX_BYTES));
        }
      } else {
        crypto.getRandomValues(bytes);
      }
    }

    return bytes;
  },
};
