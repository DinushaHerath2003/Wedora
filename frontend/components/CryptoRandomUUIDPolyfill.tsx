'use client';

import { useEffect } from 'react';

function generateUUID() {
  const bytes = new Uint8Array(16);
  const cryptoObj = globalThis.crypto || (globalThis as any).msCrypto;

  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const byteToHex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
  return `${byteToHex[bytes[0]]}${byteToHex[bytes[1]]}${byteToHex[bytes[2]]}${byteToHex[bytes[3]]}-${byteToHex[bytes[4]]}${byteToHex[bytes[5]]}-${byteToHex[bytes[6]]}${byteToHex[bytes[7]]}-${byteToHex[bytes[8]]}${byteToHex[bytes[9]]}-${byteToHex[bytes[10]]}${byteToHex[bytes[11]]}${byteToHex[bytes[12]]}${byteToHex[bytes[13]]}${byteToHex[bytes[14]]}${byteToHex[bytes[15]]}`;
}

export default function CryptoRandomUUIDPolyfill() {
  useEffect(() => {
    const cryptoObj = globalThis.crypto || (globalThis as any).msCrypto;

    if (!cryptoObj) {
      return;
    }

    if (typeof cryptoObj.randomUUID !== 'function') {
      try {
        Object.defineProperty(cryptoObj, 'randomUUID', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: generateUUID,
        });
      } catch {
        (cryptoObj as any).randomUUID = generateUUID;
      }
    }
  }, []);

  return null;
}
