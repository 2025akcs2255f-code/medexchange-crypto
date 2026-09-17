import { VaultFile } from '../types';

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES key using PBKDF2-HMAC-SHA256 with 210,000 iterations
 * Compliant with NIST SP 800-132 recommendations.
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array,
  iterations: number = 210000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(passphrase);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM authenticated encryption (RFC 5116).
 * Produces ciphertext + 16-byte GHASH authentication tag.
 */
export async function encryptVaultPayload(
  data: Uint8Array,
  passphrase: string,
  fileName: string,
  mimeType: string = 'text/plain',
  tenantId: string = '2025akcs2255f@kab.ac.ug',
  iterations: number = 210000
): Promise<VaultFile> {
  // 1. 16-byte CSPRNG Salt (NIST SP 800-132)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  // 2. 12-byte CSPRNG Nonce (RFC 5116 standard for AES-GCM)
  const nonce = window.crypto.getRandomValues(new Uint8Array(12));

  // 3. Derive 256-bit AES Key in-memory
  const aesKey = await deriveKeyFromPassphrase(passphrase, salt, iterations);

  // 4. Encrypt with AES-GCM (WebCrypto appends 16-byte tag at the end)
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128, // 16 bytes
    },
    aesKey,
    data
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const tagBytes = encryptedBytes.slice(encryptedBytes.length - 16);

  let snippet = '';
  try {
    const text = new TextDecoder().decode(data);
    snippet = text.slice(0, 100);
  } catch {
    snippet = `[Binary file: ${fileName}]`;
  }

  return {
    id: 'vault-' + Math.random().toString(36).substring(2, 9),
    name: fileName,
    mimeType,
    originalSize: data.byteLength,
    encryptedSize: encryptedBytes.byteLength,
    saltHex: bytesToHex(salt),
    nonceHex: bytesToHex(nonce),
    tagHex: bytesToHex(tagBytes),
    ciphertextBytes: encryptedBytes,
    tenantId,
    uploadedAt: new Date().toISOString(),
    isTampered: false,
    plaintextSnippet: snippet,
    iterations,
  };
}

/**
 * Decrypts a vault file using AES-256-GCM.
 * Throws an error if the 16-byte GHASH tag fails authentication.
 */
export async function decryptVaultPayload(
  vaultFile: VaultFile,
  passphrase: string
): Promise<{ data: Uint8Array; text?: string }> {
  const salt = hexToBytes(vaultFile.saltHex);
  const nonce = hexToBytes(vaultFile.nonceHex);

  // Derive AES key
  const aesKey = await deriveKeyFromPassphrase(passphrase, salt, vaultFile.iterations);

  // Decrypt and authenticate
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128,
    },
    aesKey,
    vaultFile.ciphertextBytes
  );

  const data = new Uint8Array(decryptedBuffer);
  let text: string | undefined;
  try {
    text = new TextDecoder().decode(data);
  } catch {
    // Binary
  }

  return { data, text };
}

/**
 * Simulates a physical or network tamper by altering a single byte in the ciphertext.
 */
export function tamperVaultPayload(vaultFile: VaultFile): VaultFile {
  const tamperedBytes = new Uint8Array(vaultFile.ciphertextBytes);
  // Target a byte in the ciphertext body (before the 16-byte tag)
  const targetIndex = Math.max(0, Math.floor(Math.random() * Math.max(1, tamperedBytes.length - 17)));
  tamperedBytes[targetIndex] ^= 0xff; // Invert all 8 bits of the byte

  return {
    ...vaultFile,
    ciphertextBytes: tamperedBytes,
    isTampered: true,
    tamperedByteIndex: targetIndex,
  };
}
