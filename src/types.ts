export interface RsaKeyPairInfo {
  name: string;
  role: 'sender' | 'receiver' | 'attacker';
  purpose: 'signing' | 'encryption';
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPem: string;
  fingerprint: string;
  algorithm: string;
  keySize: number;
}

export interface CryptoPackage {
  nonce: Uint8Array; // 12 bytes
  ciphertext: Uint8Array; // Includes 16-byte AES-GCM tag at the end in WebCrypto
  encryptedAesKey: Uint8Array; // 256 bytes (RSA-2048 OAEP)
  // Metadata for inspection & educational walkthrough
  rawAesKeyHex?: string;
  signatureHex?: string;
  originalPlaintext?: string;
  timestamp: number;
  payloadLength: number;
  signatureLength: number;
}

export interface DecryptionVerificationResult {
  success: boolean;
  stage: 'unwrap_key' | 'aes_decrypt' | 'verify_signature' | 'complete';
  recoveredPlaintext?: string;
  error?: string;
  errorType?: string;
  timingMs: {
    unwrapKey: number;
    aesDecrypt: number;
    verifySignature: number;
    total: number;
  };
  checks: {
    aesKeyRecovered: boolean;
    integrityValid: boolean; // AES-GCM Tag matched
    signatureValid: boolean; // RSA-PSS Signature matches Tukamushaba Derick
    nonRepudiationEstablished: boolean;
  };
}

export type TamperType = 
  | 'none'
  | 'ciphertext_byte'
  | 'wrapped_key_byte'
  | 'nonce_byte'
  | 'signature_byte'
  | 'imposter_sender_key'
  | 'wrong_receiver_key';

export interface TamperSimulationResult {
  tamperType: TamperType;
  description: string;
  attackSucceeded: boolean;
  defenseTriggered: boolean;
  caughtErrorType: string;
  explanation: string;
  tamperedByteIndex?: number;
  originalByte?: number;
  modifiedByte?: number;
}

export interface SystemState {
  aliceKeys: RsaKeyPairInfo | null;
  bobKeys: RsaKeyPairInfo | null;
  eveKeys: RsaKeyPairInfo | null;
  isGeneratingKeys: boolean;
  currentPackage: CryptoPackage | null;
  lastVerificationResult: DecryptionVerificationResult | null;
  activeAttackResult: TamperSimulationResult | null;
  executionLogs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'crypto';
  message: string;
  details?: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'keygen' | 'e2e' | 'encoding' | 'tamper' | 'boundary' | 'identity';
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  durationMs: number;
  assertion: string;
  details?: string;
  errorMessage?: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  executedAt?: string;
}

export type MainAppTab = 'portfolio' | 'vault' | 'security_lab' | 'fastapi_spec';

export interface VaultFile {
  id: string;
  name: string;
  mimeType: string;
  originalSize: number;
  encryptedSize: number;
  saltHex: string;
  nonceHex: string;
  tagHex: string;
  ciphertextBytes: Uint8Array;
  tenantId: string;
  uploadedAt: string;
  isTampered?: boolean;
  tamperedByteIndex?: number;
  plaintextSnippet?: string;
  iterations: number;
}

export interface UserProfileData {
  name: string;
  titleBadge: string;
  subtitle: string;
  email: string;
  university: string;
  location: string;
  coCollaborator: string;
  bio: string;
  competencies: string[];
  photoUrl: string;
}

export interface AuthSession {
  fullName: string;
  emailOrPhone: string;
  role: string;
  institution: string;
  token: string;
  loginTime: string;
  saltHex: string;
}

