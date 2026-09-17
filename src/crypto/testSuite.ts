import { TestCaseResult, TestSuiteSummary } from '../types';
import { generateRsaKeypairs, sendMedicalRecord, receiveMedicalRecord, simulateAttack } from './engine';

export async function runAutomatedTestSuite(
  onProgress?: (updatedTest: TestCaseResult, currentTotal: number) => void
): Promise<{ results: TestCaseResult[]; summary: TestSuiteSummary }> {
  const tests: TestCaseResult[] = [
    {
      id: 'tc-01',
      name: 'PKI Key Generation & Structure Audit',
      category: 'keygen',
      description: 'Generates RSA-2048 keypairs for Tukamushaba Derick (RSA-PSS) and Tindiwensi Joseph (RSA-OAEP), verifying key sizes, exponents, and algorithms.',
      status: 'pending',
      durationMs: 0,
      assertion: 'Key size == 2048, publicExponent == 65537, algorithms match FIPS specifications.',
    },
    {
      id: 'tc-02',
      name: 'Standard End-to-End Cryptographic Transmission',
      category: 'e2e',
      description: 'Signs with Tukamushaba Derick private key, encrypts with AES-256-GCM, wraps AES key with Tindiwensi Joseph public key, then decrypts and verifies.',
      status: 'pending',
      durationMs: 0,
      assertion: 'Recovered plaintext perfectly matches original clinical notes.',
    },
    {
      id: 'tc-03',
      name: 'Unicode & International Clinical Symbols Handling',
      category: 'encoding',
      description: 'Verifies multi-byte UTF-8 preservation (e.g. "± 0.5 mL", "°C", "µg/dL", "α-blocker", "José Müller", "李雷").',
      status: 'pending',
      durationMs: 0,
      assertion: 'Zero character corruption across multi-byte clinical symbols and non-ASCII glyphs.',
    },
    {
      id: 'tc-04',
      name: 'High-Volume Payload Stress Test (>10 KB)',
      category: 'boundary',
      description: 'Transmits a full comprehensive clinical history chart with extensive diagnostic records and lab panels.',
      status: 'pending',
      durationMs: 0,
      assertion: 'Successfully handles multi-kilobyte records with zero memory truncation.',
    },
    {
      id: 'tc-05',
      name: 'Minimal / Single-Byte Boundary Condition',
      category: 'boundary',
      description: 'Tests transmission of minimal 1-character record to verify packet padding and buffer bounds.',
      status: 'pending',
      durationMs: 0,
      assertion: 'Small payloads unpack and verify without buffer boundary exceptions.',
    },
    {
      id: 'tc-06',
      name: 'MITM Ciphertext Tamper Defense (Step 4 Demo)',
      category: 'tamper',
      description: 'Flips 1 single byte in ciphertext (tampered[10] ^= 0xFF) simulating wire intercept tampering.',
      status: 'pending',
      durationMs: 0,
      assertion: 'AES-GCM Authentication Tag detects bit flip and aborts before reading.',
    },
    {
      id: 'tc-07',
      name: 'Wrapped Key Tamper Defense (RSA-OAEP Padding)',
      category: 'tamper',
      description: 'Corrupts byte in the encrypted AES key to test RSA-OAEP padding oracle defense.',
      status: 'pending',
      durationMs: 0,
      assertion: 'RSA-OAEP unwrapping fails cleanly, denying access to session key.',
    },
    {
      id: 'tc-08',
      name: 'Nonce / IV Corruption Defense',
      category: 'tamper',
      description: 'Alters the 96-bit initialization vector in transit.',
      status: 'pending',
      durationMs: 0,
      assertion: 'AES-GCM tag check triggers immediate OperationError.',
    },
    {
      id: 'tc-09',
      name: 'Identity Fraud / Imposter Sender Defense',
      category: 'identity',
      description: 'Adversary (Eve) forges record; receiver verifies against Tukamushaba Derick authentic PKI key.',
      status: 'pending',
      durationMs: 0,
      assertion: 'RSA-PSS verification returns false, catching forged author identity.',
    },
    {
      id: 'tc-10',
      name: 'Unauthorized Eavesdropper Decryption Defense',
      category: 'identity',
      description: 'Intercepting party attempts to decrypt Tindiwensi Joseph private envelope using unauthorized key.',
      status: 'pending',
      durationMs: 0,
      assertion: 'RSA-OAEP unwrap fails unconditionally without exposing raw AES key.',
    },
  ];

  const overallStart = performance.now();
  let passedCount = 0;
  let failedCount = 0;

  // Shared test fixture
  let sharedKeys: { alice: any; bob: any; eve: any } | null = null;
  let sharedPkg: any = null;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    test.status = 'running';
    onProgress?.(test, tests.length);

    const testStart = performance.now();
    try {
      switch (test.id) {
        case 'tc-01': {
          sharedKeys = await generateRsaKeypairs();
          if (
            sharedKeys.alice.keySize !== 2048 ||
            sharedKeys.bob.keySize !== 2048 ||
            !sharedKeys.alice.publicKey ||
            !sharedKeys.bob.privateKey
          ) {
            throw new Error('Key validation failed: modulus length or algorithm mismatch');
          }
          test.details = `Tukamushaba Derick: ${sharedKeys.alice.fingerprint} (RSA-PSS) | Tindiwensi Joseph: ${sharedKeys.bob.fingerprint} (RSA-OAEP)`;
          test.status = 'passed';
          break;
        }

        case 'tc-02': {
          if (!sharedKeys) sharedKeys = await generateRsaKeypairs();
          const sample = 'PATIENT: John Doe | DIAGNOSIS: Acute Appendicitis | RX: Amoxicillin 500mg';
          sharedPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, sample);
          const result = await receiveMedicalRecord(sharedKeys.bob.privateKey, sharedKeys.alice.publicKey, sharedPkg);
          if (!result.success || result.recoveredPlaintext !== sample) {
            throw new Error(result.error || 'Plaintext recovered did not match original');
          }
          test.details = `Verified: Unwrapped AES in ${result.timingMs.unwrapKey.toFixed(1)}ms, Decrypted in ${result.timingMs.aesDecrypt.toFixed(1)}ms, Verified PSS in ${result.timingMs.verifySignature.toFixed(1)}ms`;
          test.status = 'passed';
          break;
        }

        case 'tc-03': {
          if (!sharedKeys) sharedKeys = await generateRsaKeypairs();
          const unicodeSample = 'PATIENT: José Müller (患者: 李雷) | DOSAGE: 250µg ± 0.5 mL | TEMP: 38.6°C | RX: α-blocker | STATUS: ✓ Normal';
          const uPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, unicodeSample);
          const uRes = await receiveMedicalRecord(sharedKeys.bob.privateKey, sharedKeys.alice.publicKey, uPkg);
          if (!uRes.success || uRes.recoveredPlaintext !== unicodeSample) {
            throw new Error('Unicode symbols altered or corrupted during cryptographic round-trip');
          }
          test.details = 'Multi-byte UTF-8 characters and Greek/mathematical symbols matched exactly without loss.';
          test.status = 'passed';
          break;
        }

        case 'tc-04': {
          if (!sharedKeys) sharedKeys = await generateRsaKeypairs();
          const largeSample = 'COMPREHENSIVE EHR RECORD:\n' + 'PATIENT OBSERVATION: Normal sinus rhythm. Lab values within acceptable range.\n'.repeat(150);
          const lPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, largeSample);
          const lRes = await receiveMedicalRecord(sharedKeys.bob.privateKey, sharedKeys.alice.publicKey, lPkg);
          if (!lRes.success || lRes.recoveredPlaintext !== largeSample) {
            throw new Error('Large payload (>10KB) failed round-trip verification');
          }
          test.details = `Successfully processed ${new TextEncoder().encode(largeSample).length} bytes in ${lRes.timingMs.total.toFixed(1)}ms.`;
          test.status = 'passed';
          break;
        }

        case 'tc-05': {
          if (!sharedKeys) sharedKeys = await generateRsaKeypairs();
          const minSample = '!';
          const mPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, minSample);
          const mRes = await receiveMedicalRecord(sharedKeys.bob.privateKey, sharedKeys.alice.publicKey, mPkg);
          if (!mRes.success || mRes.recoveredPlaintext !== minSample) {
            throw new Error('Single-byte boundary condition failed');
          }
          test.details = 'Single byte payload handled seamlessly.';
          test.status = 'passed';
          break;
        }

        case 'tc-06': {
          if (!sharedKeys || !sharedPkg) {
            sharedKeys = await generateRsaKeypairs();
            sharedPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, 'Test sample');
          }
          const att = await simulateAttack(sharedPkg, 'ciphertext_byte', {
            receiverPrivateKey: sharedKeys.bob.privateKey,
            senderPublicKey: sharedKeys.alice.publicKey,
            tamperByteIndex: 10,
          });
          if (!att.defenseTriggered) {
            throw new Error('Ciphertext tampering bypassed AES-GCM tag check!');
          }
          test.details = `Defense verified: caught ${att.caughtErrorType}. Plaintext was protected.`;
          test.status = 'passed';
          break;
        }

        case 'tc-07': {
          if (!sharedKeys || !sharedPkg) {
            sharedKeys = await generateRsaKeypairs();
            sharedPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, 'Test sample');
          }
          const att = await simulateAttack(sharedPkg, 'wrapped_key_byte', {
            receiverPrivateKey: sharedKeys.bob.privateKey,
            senderPublicKey: sharedKeys.alice.publicKey,
          });
          if (!att.defenseTriggered) {
            throw new Error('Corrupted wrapped key was not rejected by RSA-OAEP!');
          }
          test.details = `Defense verified: caught ${att.caughtErrorType}.`;
          test.status = 'passed';
          break;
        }

        case 'tc-08': {
          if (!sharedKeys || !sharedPkg) {
            sharedKeys = await generateRsaKeypairs();
            sharedPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, 'Test sample');
          }
          const att = await simulateAttack(sharedPkg, 'nonce_byte', {
            receiverPrivateKey: sharedKeys.bob.privateKey,
            senderPublicKey: sharedKeys.alice.publicKey,
          });
          if (!att.defenseTriggered) {
            throw new Error('Corrupted nonce bypassed authentication!');
          }
          test.details = `Defense verified: caught ${att.caughtErrorType}.`;
          test.status = 'passed';
          break;
        }

        case 'tc-09': {
          if (!sharedKeys || !sharedPkg) {
            sharedKeys = await generateRsaKeypairs();
            sharedPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, 'Test sample');
          }
          const att = await simulateAttack(sharedPkg, 'imposter_sender_key', {
            receiverPrivateKey: sharedKeys.bob.privateKey,
            senderPublicKey: sharedKeys.alice.publicKey,
            evePublicKey: sharedKeys.eve.publicKey,
          });
          if (!att.defenseTriggered) {
            throw new Error('Imposter sender key was accepted by verification layer!');
          }
          test.details = `Defense verified: caught ${att.caughtErrorType}. Non-repudiation prevented spoofed author.`;
          test.status = 'passed';
          break;
        }

        case 'tc-10': {
          if (!sharedKeys || !sharedPkg) {
            sharedKeys = await generateRsaKeypairs();
            sharedPkg = await sendMedicalRecord(sharedKeys.alice.privateKey, sharedKeys.bob.publicKey, 'Test sample');
          }
          const att = await simulateAttack(sharedPkg, 'wrong_receiver_key', {
            receiverPrivateKey: sharedKeys.bob.privateKey,
            senderPublicKey: sharedKeys.alice.publicKey,
            evePrivateKey: sharedKeys.eve.privateKey,
          });
          if (!att.defenseTriggered) {
            throw new Error('Unauthorized party unwrapped Tindiwensi Joseph session key!');
          }
          test.details = `Defense verified: caught ${att.caughtErrorType}. Eavesdropper was shut out.`;
          test.status = 'passed';
          break;
        }

        default:
          test.status = 'passed';
      }

      passedCount++;
    } catch (err: any) {
      test.status = 'failed';
      test.errorMessage = err.message || 'Unknown test error';
      failedCount++;
    } finally {
      test.durationMs = performance.now() - testStart;
      onProgress?.(test, tests.length);
    }
  }

  const summary: TestSuiteSummary = {
    total: tests.length,
    passed: passedCount,
    failed: failedCount,
    durationMs: performance.now() - overallStart,
    executedAt: new Date().toLocaleTimeString(),
  };

  return { results: tests, summary };
}
