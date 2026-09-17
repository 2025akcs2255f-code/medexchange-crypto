import { CryptoPackage, DecryptionVerificationResult, RsaKeyPairInfo, TamperSimulationResult, TamperType } from '../types';

/**
 * Utility functions for binary/hex conversion and formatting
 */
export function bufToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBuf(hexString: string): Uint8Array {
  const clean = hexString.replace(/\s+/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

export function formatHexPretty(hex: string, maxBytes = 32): string {
  if (!hex) return '';
  const truncated = hex.length > maxBytes * 2;
  const target = truncated ? hex.slice(0, maxBytes * 2) : hex;
  const groups = target.match(/.{1,2}/g)?.join(' ') || '';
  return truncated ? `${groups}... (${Math.floor(hex.length / 2)} bytes total)` : groups;
}

export async function exportKeyToPem(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
  return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
}

export async function computeKeyFingerprint(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  const digest = await window.crypto.subtle.digest('SHA-256', exported);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
}

/**
 * Step 1: PKI Setup - Generate RSA-2048 keypairs for Tukamushaba Derick (Sender) and Tindiwensi Joseph (Receiver)
 * Tukamushaba Derick uses RSA-PSS for digital signing.
 * Tindiwensi Joseph uses RSA-OAEP for key wrapping.
 * Eve is generated for attack simulations.
 */
export async function generateRsaKeypairs(): Promise<{
  alice: RsaKeyPairInfo;
  bob: RsaKeyPairInfo;
  eve: RsaKeyPairInfo;
}> {
  // 1. Tukamushaba Derick (Sender): RSA-PSS for signing
  const alicePair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );

  const alicePem = await exportKeyToPem(alicePair.publicKey);
  const aliceFp = await computeKeyFingerprint(alicePair.publicKey);

  const alice: RsaKeyPairInfo = {
    name: 'Tukamushaba Derick',
    role: 'sender',
    purpose: 'signing',
    publicKey: alicePair.publicKey,
    privateKey: alicePair.privateKey,
    publicKeyPem: alicePem,
    fingerprint: aliceFp,
    algorithm: 'RSA-PSS (SHA-256, 2048-bit)',
    keySize: 2048,
  };

  // 2. Tindiwensi Joseph (Receiver): RSA-OAEP for key encryption/wrapping
  const bobPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const bobPem = await exportKeyToPem(bobPair.publicKey);
  const bobFp = await computeKeyFingerprint(bobPair.publicKey);

  const bob: RsaKeyPairInfo = {
    name: 'Tindiwensi Joseph',
    role: 'receiver',
    purpose: 'encryption',
    publicKey: bobPair.publicKey,
    privateKey: bobPair.privateKey,
    publicKeyPem: bobPem,
    fingerprint: bobFp,
    algorithm: 'RSA-OAEP (SHA-256, 2048-bit)',
    keySize: 2048,
  };

  // 3. Attacker (Eve): For simulating MITM / unauthorized identity injection
  const evePair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );

  const evePem = await exportKeyToPem(evePair.publicKey);
  const eveFp = await computeKeyFingerprint(evePair.publicKey);

  const eve: RsaKeyPairInfo = {
    name: 'Eve (Adversary)',
    role: 'attacker',
    purpose: 'signing',
    publicKey: evePair.publicKey,
    privateKey: evePair.privateKey,
    publicKeyPem: evePem,
    fingerprint: eveFp,
    algorithm: 'RSA-PSS (Rogue Keypair)',
    keySize: 2048,
  };

  return { alice, bob, eve };
}

/**
 * Step 2: Sender Operations (Tukamushaba Derick)
 * 1. NON-REPUDIATION: Digital Signature (RSA-PSS with SHA-256)
 * 2. Bundles [4 bytes big-endian length] + [signature] + [medical record]
 * 3. CONFIDENTIALITY & INTEGRITY: Generate random 256-bit AES key & encrypt with AES-GCM (12-byte nonce)
 * 4. CONFIDENTIALITY: Wrap AES key with Receiver's (Tindiwensi Joseph) RSA-OAEP public key
 */
export async function sendMedicalRecord(
  senderPrivateKey: CryptoKey,
  receiverPublicKey: CryptoKey,
  medicalRecordText: string
): Promise<CryptoPackage> {
  const encoder = new TextEncoder();
  const medicalRecordBytes = encoder.encode(medicalRecordText);

  // 1. NON-REPUDIATION: Sign record with Tukamushaba Derick's Private Key
  // In Python: salt_length=padding.PSS.MAX_LENGTH (~32 bytes for SHA256 / 2048 key)
  const signatureBuffer = await window.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    senderPrivateKey,
    medicalRecordBytes
  );
  const signatureBytes = new Uint8Array(signatureBuffer);

  // Package format: [4 bytes signature length big-endian] + [signature] + [medical record]
  const sigLen = signatureBytes.length; // 256 bytes for RSA-2048
  const payload = new Uint8Array(4 + sigLen + medicalRecordBytes.length);
  const dataView = new DataView(payload.buffer);
  dataView.setUint32(0, sigLen, false); // big-endian
  payload.set(signatureBytes, 4);
  payload.set(medicalRecordBytes, 4 + sigLen);

  // 2. CONFIDENTIALITY & INTEGRITY: Generate AES-256-GCM key & encrypt payload
  const aesKey = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  const rawAesKeyBuffer = await window.crypto.subtle.exportKey('raw', aesKey);
  const rawAesKeyBytes = new Uint8Array(rawAesKeyBuffer);

  // 96-bit (12-byte) random nonce
  const nonce = window.crypto.getRandomValues(new Uint8Array(12));

  // AES-GCM encryption (includes 16-byte authentication tag in the output)
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    aesKey,
    payload
  );
  const ciphertextBytes = new Uint8Array(ciphertextBuffer);

  // 3. CONFIDENTIALITY: Encrypt (wrap) AES key using Receiver's RSA-OAEP Public Key
  const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    receiverPublicKey,
    rawAesKeyBytes
  );
  const encryptedAesKeyBytes = new Uint8Array(encryptedAesKeyBuffer);

  return {
    nonce,
    ciphertext: ciphertextBytes,
    encryptedAesKey: encryptedAesKeyBytes,
    rawAesKeyHex: bufToHex(rawAesKeyBytes),
    signatureHex: bufToHex(signatureBytes),
    originalPlaintext: medicalRecordText,
    timestamp: Date.now(),
    payloadLength: payload.length,
    signatureLength: sigLen,
  };
}

/**
 * Step 3: Receiver Operations (Tindiwensi Joseph)
 * 1. CONFIDENTIALITY: Decrypt AES key with Receiver's Private Key (RSA-OAEP)
 * 2. INTEGRITY & CONFIDENTIALITY: Decrypt ciphertext using AES-GCM (verifying auth tag)
 * 3. AUTHENTICATION & NON-REPUDIATION: Unpack payload and verify RSA-PSS signature with Tukamushaba Derick's Public Key
 */
export async function receiveMedicalRecord(
  receiverPrivateKey: CryptoKey,
  senderPublicKey: CryptoKey,
  cryptoPackage: CryptoPackage
): Promise<DecryptionVerificationResult> {
  const startTime = performance.now();
  let tUnwrap = 0;
  let tAes = 0;
  let tVerify = 0;

  const result: DecryptionVerificationResult = {
    success: false,
    stage: 'unwrap_key',
    timingMs: { unwrapKey: 0, aesDecrypt: 0, verifySignature: 0, total: 0 },
    checks: {
      aesKeyRecovered: false,
      integrityValid: false,
      signatureValid: false,
      nonRepudiationEstablished: false,
    },
  };

  let aesKey: CryptoKey;

  // 1. Unwrap AES key using Receiver's Private Key
  try {
    const unwrapStart = performance.now();
    const rawAesKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      receiverPrivateKey,
      cryptoPackage.encryptedAesKey
    );
    tUnwrap = performance.now() - unwrapStart;

    // Import recovered AES-256 key
    aesKey = await window.crypto.subtle.importKey(
      'raw',
      rawAesKeyBuffer,
      {
        name: 'AES-GCM',
      },
      false,
      ['decrypt']
    );
    result.checks.aesKeyRecovered = true;
    result.stage = 'aes_decrypt';
  } catch (err: any) {
    result.error = `Failed to unwrap AES key: ${err.message || err.name || 'Invalid RSA-OAEP ciphertext'}`;
    result.errorType = err.name || 'OperationError';
    result.timingMs = { unwrapKey: tUnwrap, aesDecrypt: 0, verifySignature: 0, total: performance.now() - startTime };
    return result;
  }

  // 2. Decrypt ciphertext using AES-GCM (Automatic Tag Validation)
  let decryptedPayload: Uint8Array;
  try {
    const aesStart = performance.now();
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: cryptoPackage.nonce,
      },
      aesKey,
      cryptoPackage.ciphertext
    );
    tAes = performance.now() - aesStart;
    decryptedPayload = new Uint8Array(decryptedBuffer);
    result.checks.integrityValid = true;
    result.stage = 'verify_signature';
  } catch (err: any) {
    result.error = `Integrity violation: AES-GCM authentication tag mismatch or corrupted ciphertext. Data was tampered with in transit!`;
    result.errorType = err.name || 'OperationError (InvalidTag)';
    result.timingMs = { unwrapKey: tUnwrap, aesDecrypt: tAes, verifySignature: 0, total: performance.now() - startTime };
    return result;
  }

  // 3. Unpack payload: [4 bytes length] + [signature] + [medical record]
  if (decryptedPayload.length < 4) {
    result.error = 'Payload truncated: Missing signature length header.';
    result.errorType = 'PayloadMalformed';
    return result;
  }

  const dataView = new DataView(decryptedPayload.buffer, decryptedPayload.byteOffset, decryptedPayload.byteLength);
  const sigLen = dataView.getUint32(0, false);

  if (decryptedPayload.length < 4 + sigLen) {
    result.error = `Payload corrupted: expected signature of ${sigLen} bytes, got payload length of ${decryptedPayload.length}.`;
    result.errorType = 'InvalidPayloadStructure';
    return result;
  }

  const signature = decryptedPayload.slice(4, 4 + sigLen);
  const medicalRecordBytes = decryptedPayload.slice(4 + sigLen);

  // 4. Verify Digital Signature with Tukamushaba Derick's Public Key
  try {
    const verifyStart = performance.now();
    const isValid = await window.crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      senderPublicKey,
      signature,
      medicalRecordBytes
    );
    tVerify = performance.now() - verifyStart;

    if (!isValid) {
      result.error = 'Invalid signature: RSA-PSS verification failed. Record sender cannot be authenticated or content was forged.';
      result.errorType = 'InvalidSignatureException';
      result.timingMs = { unwrapKey: tUnwrap, aesDecrypt: tAes, verifySignature: tVerify, total: performance.now() - startTime };
      return result;
    }

    result.checks.signatureValid = true;
    result.checks.nonRepudiationEstablished = true;
    result.stage = 'complete';
    result.success = true;

    const decoder = new TextDecoder('utf-8');
    result.recoveredPlaintext = decoder.decode(medicalRecordBytes);
  } catch (err: any) {
    result.error = `Digital signature verification error: ${err.message || 'Signature mismatch'}`;
    result.errorType = err.name || 'VerificationError';
  }

  result.timingMs = {
    unwrapKey: tUnwrap,
    aesDecrypt: tAes,
    verifySignature: tVerify,
    total: performance.now() - startTime,
  };

  return result;
}

/**
 * Step 4: Live Security Attack Simulation (Integrity Violation & Adversary Probing)
 */
export async function simulateAttack(
  originalPackage: CryptoPackage,
  attackType: TamperType,
  options: {
    receiverPrivateKey: CryptoKey;
    senderPublicKey: CryptoKey;
    evePrivateKey?: CryptoKey;
    evePublicKey?: CryptoKey;
    tamperByteIndex?: number;
  }
): Promise<TamperSimulationResult> {
  const { receiverPrivateKey, senderPublicKey, evePublicKey, tamperByteIndex = 10 } = options;

  let manipulatedPackage: CryptoPackage = {
    ...originalPackage,
    nonce: new Uint8Array(originalPackage.nonce),
    ciphertext: new Uint8Array(originalPackage.ciphertext),
    encryptedAesKey: new Uint8Array(originalPackage.encryptedAesKey),
  };

  let description = '';
  let expectedError = '';
  let origByte = 0;
  let modByte = 0;

  switch (attackType) {
    case 'ciphertext_byte': {
      // Step 4 in python script: modify 1 byte in ciphertext (index 10 ^= 0xFF)
      const tampered = new Uint8Array(originalPackage.ciphertext);
      const idx = Math.min(tamperByteIndex, tampered.length - 1);
      origByte = tampered[idx];
      tampered[idx] ^= 0xff;
      modByte = tampered[idx];
      manipulatedPackage.ciphertext = tampered;
      description = `Flipped 8 bits at ciphertext byte index ${idx} (0x${origByte.toString(16).padStart(2, '0')} -> 0x${modByte.toString(16).padStart(2, '0')}).`;
      expectedError = 'OperationError / InvalidTag caught';
      break;
    }

    case 'nonce_byte': {
      const tampered = new Uint8Array(originalPackage.nonce);
      origByte = tampered[0];
      tampered[0] ^= 0x55;
      modByte = tampered[0];
      manipulatedPackage.nonce = tampered;
      description = `Corrupted 96-bit AES-GCM IV / Nonce byte 0 (0x${origByte.toString(16).padStart(2, '0')} -> 0x${modByte.toString(16).padStart(2, '0')}).`;
      expectedError = 'OperationError (AES-GCM Auth Tag Failure)';
      break;
    }

    case 'wrapped_key_byte': {
      const tampered = new Uint8Array(originalPackage.encryptedAesKey);
      origByte = tampered[15];
      tampered[15] ^= 0xaa;
      modByte = tampered[15];
      manipulatedPackage.encryptedAesKey = tampered;
      description = `Corrupted RSA-OAEP Wrapped Key at byte 15.`;
      expectedError = 'OperationError (OAEP padding / hash verification failed)';
      break;
    }

    case 'signature_byte': {
      // Simulate an insider or attacker modifying the signature portion
      // We test RSA-PSS defense: signature byte corrupted
      description = `Insider / Forged Signature Attack: Manipulating digital signature bits to test RSA-PSS non-repudiation barrier.`;
      expectedError = 'InvalidSignatureException (Signature Verification Failure)';
      
      // To test RSA-PSS specifically, we construct a package where the signature was forged
      try {
        const encoder = new TextEncoder();
        const recordBytes = encoder.encode(originalPackage.originalPlaintext || 'PATIENT RECORD');
        
        // Generate a bogus or corrupted signature
        const bogusSig = new Uint8Array(256);
        window.crypto.getRandomValues(bogusSig);

        const sigLen = bogusSig.length;
        const payload = new Uint8Array(4 + sigLen + recordBytes.length);
        const dataView = new DataView(payload.buffer);
        dataView.setUint32(0, sigLen, false);
        payload.set(bogusSig, 4);
        payload.set(recordBytes, 4 + sigLen);

        // Encrypt with raw AES key from original package to test RSA-PSS layer
        const rawAes = originalPackage.rawAesKeyHex ? hexToBuf(originalPackage.rawAesKeyHex) : new Uint8Array(32);
        const aesKey = await window.crypto.subtle.importKey('raw', rawAes, { name: 'AES-GCM' }, false, ['encrypt']);
        const nonce = window.crypto.getRandomValues(new Uint8Array(12));
        const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, payload);

        manipulatedPackage = {
          ...originalPackage,
          nonce,
          ciphertext: new Uint8Array(ct),
        };
      } catch {
        // Fallback to ciphertext byte tamper
        const tampered = new Uint8Array(originalPackage.ciphertext);
        tampered[0] ^= 0x01;
        manipulatedPackage.ciphertext = tampered;
      }
      break;
    }

    case 'imposter_sender_key': {
      description = `Adversary (Eve) impersonates Tukamushaba Derick: verifying record using Eve's public key instead of Tukamushaba Derick's authentic PKI key.`;
      expectedError = 'InvalidSignatureException / Verification Failure';
      break;
    }

    case 'wrong_receiver_key': {
      description = `Eavesdropper interception: An unauthorized party tries to unwrap Tindiwensi Joseph's AES key using an unauthorized private key.`;
      expectedError = 'OperationError (RSA-OAEP Decryption Failure)';
      break;
    }

    default:
      return {
        tamperType: 'none',
        description: 'No attack active. Normal secure state.',
        attackSucceeded: false,
        defenseTriggered: false,
        caughtErrorType: 'None',
        explanation: 'System operating normally under full cryptographic defense.',
      };
  }

  // Attempt decryption/verification with the manipulated package or key
  const testSenderKey = attackType === 'imposter_sender_key' && evePublicKey ? evePublicKey : senderPublicKey;
  const testReceiverKey = attackType === 'wrong_receiver_key' && options.evePrivateKey ? options.evePrivateKey : receiverPrivateKey;

  const result = await receiveMedicalRecord(testReceiverKey, testSenderKey, manipulatedPackage);

  if (!result.success) {
    return {
      tamperType: attackType,
      description,
      attackSucceeded: false,
      defenseTriggered: true,
      caughtErrorType: result.errorType || 'IntegrityCheckFailed',
      explanation: `SUCCESSFUL DEFENSE: ${result.error || expectedError}. The tampered or rogue data was rejected before plaintext exposure!`,
      tamperedByteIndex: tamperByteIndex,
      originalByte: origByte,
      modifiedByte: modByte,
    };
  } else {
    return {
      tamperType: attackType,
      description,
      attackSucceeded: true,
      defenseTriggered: false,
      caughtErrorType: 'None (Bypassed)',
      explanation: 'WARNING: Attack was not detected by cryptographic layer.',
      tamperedByteIndex: tamperByteIndex,
      originalByte: origByte,
      modifiedByte: modByte,
    };
  }
}
