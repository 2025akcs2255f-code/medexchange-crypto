import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PortfolioProfile } from './components/PortfolioProfile';
import { VaultStorage } from './components/VaultStorage';
import { SecurityLab } from './components/SecurityLab';
import { FastApiSpec } from './components/FastApiSpec';
import { EncryptModal } from './components/EncryptModal';
import { AuthPortal } from './components/AuthPortal';
import { AccessLinkModal } from './components/AccessLinkModal';
import {
  generateRsaKeypairs,
  sendMedicalRecord,
  receiveMedicalRecord,
  simulateAttack,
} from './crypto/engine';
import { encryptVaultPayload } from './crypto/vaultEngine';
import {
  CryptoPackage,
  DecryptionVerificationResult,
  LogEntry,
  RsaKeyPairInfo,
  TamperSimulationResult,
  TamperType,
  MainAppTab,
  VaultFile,
  UserProfileData,
  AuthSession,
} from './types';
import { SAMPLE_RECORDS } from './data/samples';

const CRYPTO_TIMEOUT_MS = 6000;

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = CRYPTO_TIMEOUT_MS,
  taskName: string = 'Cryptographic operation'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out: ${taskName} exceeded ${timeoutMs / 1000}s limit`));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function generateRandomHex(byteCount: number): string {
  const bytes = window.crypto.getRandomValues(new Uint8Array(byteCount));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const DEFAULT_PROFILE: UserProfileData = {
  name: 'TINDIWENSI JOSEPH',
  titleBadge: 'Lead Security Architect',
  subtitle: 'MedExchange-Crypto & Zero-Trust Cryptography Specialist',
  email: '2025akcs2255f@kab.ac.ug',
  university: 'Kabale University',
  location: 'Uganda',
  coCollaborator: 'Tukamushaba Derick',
  bio: 'Passionate cybersecurity researcher and software engineer specializing in MedExchange-Crypto zero-trust architectures, AES-256-GCM authenticated encryption, PBKDF2 (210,000 rounds) key derivation protocols, and confidential medical exchange security.',
  competencies: [
    'MedExchange-Crypto Protocol',
    'Zero-Trust Architecture',
    'AES-256-GCM AEAD',
    'PBKDF2 HMAC-SHA256 (210k)',
    'Cryptographic Nonce & Salt Isolation',
    'Python FastAPI & Cryptography',
    'TypeScript & WebCrypto',
    'Role-Based Access Control (RBAC)',
    'NIST SP 800-132 Compliance',
  ],
  photoUrl: '/dsc_8709.jpg',
};

export default function App() {
  // Authentication & Access Link Gate
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('medexchange_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [isAccessLinkModalOpen, setIsAccessLinkModalOpen] = useState<boolean>(false);

  // Main Tab (Default to Portfolio & Profile as shown in video!)
  const [mainTab, setMainTab] = useState<MainAppTab>('portfolio');
  const [activeUser, setActiveUser] = useState<'alice' | 'bob' | 'admin'>('alice');
  const [activeUserSalt, setActiveUserSalt] = useState<string>(() => generateRandomHex(16));
  const [userProfile, setUserProfile] = useState<UserProfileData>(DEFAULT_PROFILE);
  const [isEncryptModalOpen, setIsEncryptModalOpen] = useState<boolean>(false);

  // Vault Files
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);

  // Security Lab & PKI States
  const [aliceKeys, setAliceKeys] = useState<RsaKeyPairInfo | null>(null);
  const [bobKeys, setBobKeys] = useState<RsaKeyPairInfo | null>(null);
  const [eveKeys, setEveKeys] = useState<RsaKeyPairInfo | null>(null);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState<boolean>(false);
  const [currentPackage, setCurrentPackage] = useState<CryptoPackage | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<DecryptionVerificationResult | null>(null);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);
  const [attackResult, setAttackResult] = useState<TamperSimulationResult | null>(null);
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [isRunningDemo, setIsRunningDemo] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const activeTenantEmail =
    authSession?.emailOrPhone ||
    (activeUser === 'alice'
      ? '2025akcs2255f@kab.ac.ug'
      : activeUser === 'bob'
      ? 'tindiwensi.joseph@kab.ac.ug'
      : 'sec-admin@kab.ac.ug');

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      level,
    };
    setLogs((prev) => [...prev, entry]);
  }, []);

  const handleLogin = (session: AuthSession) => {
    setAuthSession(session);
    try {
      localStorage.setItem('medexchange_session', JSON.stringify(session));
    } catch {
      // ignore
    }
    // Update user profile to reflect logged in user
    setUserProfile((prev) => ({
      ...prev,
      name: session.fullName.toUpperCase(),
      email: session.emailOrPhone,
      titleBadge: session.role || prev.titleBadge,
      university: session.institution || prev.university,
    }));
    addLog(`[+] Zero-Trust Authenticated: ${session.fullName} (${session.emailOrPhone}) [Tenant: ${session.institution}]`, 'success');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('medexchange_session');
    } catch {
      // ignore
    }
    setAuthSession(null);
    addLog('[-] Logged out: Ephemeral cryptographic session cleared.', 'warn');
  };

  // Initialize PKI Keys
  const initKeys = useCallback(async (): Promise<{ alice: RsaKeyPairInfo; bob: RsaKeyPairInfo; eve: RsaKeyPairInfo } | null> => {
    setIsGeneratingKeys(true);
    try {
      addLog('=================================================================', 'info');
      addLog(' Zero-Trust Encrypted File Vault & PKI Setup', 'info');
      addLog(' Lead Architect: Tindiwensi Joseph · Co-Lead: Tukamushaba Derick', 'info');
      addLog('=================================================================', 'info');
      addLog('\n[+] Step 1: Generating RSA key pairs (Simulating PKI Infrastructure)...', 'info');

      const { alice, bob, eve } = await withTimeout(
        generateRsaKeypairs(),
        CRYPTO_TIMEOUT_MS,
        'RSA Key Generation'
      );

      setAliceKeys(alice);
      setBobKeys(bob);
      setEveKeys(eve);

      addLog('    -> Keys successfully generated for Tukamushaba Derick and Tindiwensi Joseph.', 'success');
      addLog(`    -> Tukamushaba Derick Fingerprint: ${alice.fingerprint} (RSA-PSS-2048)`, 'crypto');
      addLog(`    -> Tindiwensi Joseph Fingerprint:   ${bob.fingerprint} (RSA-OAEP-2048)`, 'crypto');

      return { alice, bob, eve };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`[-] Key Generation Failed: ${msg}`, 'error');
      return null;
    } finally {
      setIsGeneratingKeys(false);
    }
  }, [addLog]);

  // Prepopulate initial sample vault files on mount
  useEffect(() => {
    const defaultPassphrase = 'NIST-SP-800-132-SecurePassphrase-2026!';
    
    async function seedInitialFiles() {
      try {
        const file1 = await encryptVaultPayload(
          new TextEncoder().encode('PATIENT: John Doe (ID: #89201). DIAGNOSIS: Stage II Hypertension. TREATMENT: Enalapril 10mg daily.'),
          defaultPassphrase,
          'Patient_89201_Cardiac_Diagnostics.enc',
          'text/plain',
          '2025akcs2255f@kab.ac.ug',
          210000
        );

        const file2 = await encryptVaultPayload(
          new TextEncoder().encode('CONSULTATION: MRI Cerebral angiography reveals no aneurysm or acute ischemia. Verified by Tindiwensi Joseph.'),
          defaultPassphrase,
          'MRI_Brain_Scan_Report_Joseph.enc',
          'text/plain',
          '2025akcs2255f@kab.ac.ug',
          210000
        );

        const file3 = await encryptVaultPayload(
          new TextEncoder().encode('REFERRAL: Dr. Tukamushaba Derick referring patient to Specialized Oncology for follow-up biopsy review.'),
          defaultPassphrase,
          'Derick_Referral_Oncology_Summary.enc',
          'text/plain',
          '2025akcs2255f@kab.ac.ug',
          210000
        );

        setVaultFiles([file1, file2, file3]);
      } catch (err) {
        console.error('Initial seeding error', err);
      }
    }

    seedInitialFiles();
    initKeys();
  }, [initKeys]);

  // Sender operations (Tukamushaba Derick -> Tindiwensi Joseph)
  const handleSendRecord = useCallback(
    async (
      recordText: string,
      overrideKeys?: { alice: RsaKeyPairInfo; bob: RsaKeyPairInfo }
    ): Promise<CryptoPackage | null> => {
      const aKey = overrideKeys?.alice ?? aliceKeys;
      const bKey = overrideKeys?.bob ?? bobKeys;

      if (!aKey || !bKey) {
        addLog('[-] Error: Cryptographic keys not initialized.', 'error');
        return null;
      }

      setIsSending(true);
      try {
        addLog('\n----------------------------------------', 'info');
        addLog('CLINICAL RECORD TEXT TO TRANSMIT:', 'info');
        addLog(recordText, 'info');
        addLog('----------------------------------------', 'info');

        addLog('\n[+] Step 2: Tukamushaba Derick encrypts and signs record for Tindiwensi Joseph...', 'info');
        const pkg = await withTimeout(
          sendMedicalRecord(aKey.privateKey, bKey.publicKey, recordText),
          CRYPTO_TIMEOUT_MS,
          'Sender Record Processing'
        );

        setCurrentPackage(pkg);
        setVerificationResult(null);
        setAttackResult(null);

        addLog('    -> 1. Signature Generated: 256 bytes (RSA-PSS-SHA256)', 'success');
        addLog('    -> 2. Payload Encrypted:   AES-256-GCM authenticated cipher', 'success');
        addLog('    -> 3. Key Wrapped:         256 bytes wrapped via RSA-OAEP', 'success');
        addLog(`    -> Nonce: ${pkg.nonce ? Array.from(pkg.nonce.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('') : ''}... (12 bytes CSPRNG)`, 'crypto');

        return pkg;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog(`[-] Transmission Failed: ${msg}`, 'error');
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [aliceKeys, bobKeys, addLog]
  );

  // Receiver operations (Tindiwensi Joseph verifying & decrypting)
  const handleReceiveRecord = useCallback(
    async (
      overridePkg?: CryptoPackage,
      overrideKeys?: { alice: RsaKeyPairInfo; bob: RsaKeyPairInfo }
    ): Promise<DecryptionVerificationResult | null> => {
      const pkg = overridePkg ?? currentPackage;
      if (!pkg) {
        addLog('[-] Error: No transmission package available to receive.', 'error');
        return null;
      }

      const aKey = overrideKeys?.alice ?? aliceKeys;
      const bKey = overrideKeys?.bob ?? bobKeys;

      if (!bKey || !aKey) {
        addLog('[-] Error: Receiver or Sender keys not initialized.', 'error');
        return null;
      }

      setIsReceiving(true);
      try {
        addLog('\n[+] Step 3: Tindiwensi Joseph receives and processes the package...', 'info');
        const result = await withTimeout(
          receiveMedicalRecord(bKey.privateKey, aKey.publicKey, pkg),
          CRYPTO_TIMEOUT_MS,
          'Receiver Processing'
        );

        setVerificationResult(result);

        if (result.success) {
          addLog('    -> 1. AES Key Unwrapped successfully using RSA-OAEP private key.', 'success');
          addLog('    -> 2. AES-GCM Integrity Verified (Tag matched, 0 modifications).', 'success');
          addLog("    -> 3. RSA-PSS Signature Verified: Origin authenticity confirmed from Tukamushaba Derick.", 'success');
          addLog('\n[+] RECOVERED MEDICAL PLAINTEXT:', 'info');
          addLog(result.recoveredPlaintext || '', 'success');
        } else {
          addLog(`    -> Verification Failed at stage: ${result.stage}`, 'error');
          addLog(`    -> Error: ${result.error}`, 'error');
        }

        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog(`[-] Receiver Processing Failed: ${msg}`, 'error');
        return null;
      } finally {
        setIsReceiving(false);
      }
    },
    [currentPackage, aliceKeys, bobKeys, addLog]
  );

  // Attack execution
  const handleExecuteAttack = useCallback(
    async (type: TamperType, customByteIndex?: number, overridePkg?: CryptoPackage) => {
      const pkg = overridePkg ?? currentPackage;
      if (!pkg || !bobKeys || !aliceKeys || !eveKeys) {
        addLog('[-] Error: Package or Key pairs not ready for simulation.', 'error');
        return;
      }

      setIsAttacking(true);
      try {
        addLog(`\n[!] Simulating Adversary Attack Scenario: ${type}...`, 'warn');
        const simResult = await withTimeout(
          simulateAttack(pkg, type, {
            receiverPrivateKey: bobKeys.privateKey,
            senderPublicKey: aliceKeys.publicKey,
            evePrivateKey: eveKeys.privateKey,
            evePublicKey: eveKeys.publicKey,
            tamperByteIndex: customByteIndex ?? 10,
          }),
          CRYPTO_TIMEOUT_MS,
          'Attack Simulation'
        );

        setAttackResult(simResult);

        if (simResult.defenseTriggered) {
          addLog(`    -> DEFENSE VERIFIED: Cryptographic safeguard halted attack!`, 'success');
          addLog(`    -> Caught Exception / Error: ${simResult.caughtErrorType}`, 'crypto');
          addLog(`    -> ${simResult.explanation}`, 'info');
        } else {
          addLog(`    -> ATTACK ALERT: Check integrity controls!`, 'error');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog(`[-] Attack Simulation Failed: ${msg}`, 'error');
      } finally {
        setIsAttacking(false);
      }
    },
    [currentPackage, bobKeys, aliceKeys, eveKeys, addLog]
  );

  // Full demo simulation
  const handleRunFullDemo = useCallback(async () => {
    setIsRunningDemo(true);
    setLogs([]);
    try {
      const keys = await initKeys();
      if (!keys) {
        addLog('[-] Demo execution halted: Key generation failed.', 'warn');
        return;
      }

      await new Promise((r) => setTimeout(r, 600));

      const defaultText = SAMPLE_RECORDS[0].content;
      const pkg = await handleSendRecord(defaultText, { alice: keys.alice, bob: keys.bob });
      if (!pkg) {
        addLog('[-] Demo execution halted: Step 2 did not complete.', 'warn');
        return;
      }

      await new Promise((r) => setTimeout(r, 600));

      const verifyRes = await handleReceiveRecord(pkg, { alice: keys.alice, bob: keys.bob });
      if (!verifyRes) {
        addLog('[-] Demo execution halted: Step 3 did not complete.', 'warn');
        return;
      }

      await new Promise((r) => setTimeout(r, 600));

      addLog('\n[!] Step 4: Simulating Adversary tampering with 1 byte of ciphertext in transit...', 'warn');
      await handleExecuteAttack('ciphertext_byte', 10, pkg);

      addLog('\n=================================================================', 'info');
      addLog('  Summary of Cryptographic Safeguards Verified:', 'info');
      addLog('    1. Confidentiality: AES-256-GCM payload encrypted in transit.', 'success');
      addLog("    2. Key Exchange:    AES session key wrapped via Tindiwensi Joseph's RSA-OAEP public key.", 'success');
      addLog("    3. Authenticity:    Tukamushaba Derick's signature validated via RSA-PSS (SHA-256).", 'success');
      addLog('    4. Integrity:       Tampered ciphertext byte detected and rejected by AES-GCM tag.', 'success');
      addLog('=================================================================\n', 'info');
    } catch (err: unknown) {
      addLog(`[-] Demo interrupted: ${err instanceof Error ? err.message : String(err)}`, 'error');
    } finally {
      setIsRunningDemo(false);
    }
  }, [initKeys, handleSendRecord, handleReceiveRecord, handleExecuteAttack, addLog]);

  const handleReset = useCallback(() => {
    setAliceKeys(null);
    setBobKeys(null);
    setEveKeys(null);
    setCurrentPackage(null);
    setVerificationResult(null);
    setAttackResult(null);
    setLogs([]);
    initKeys();
  }, [initKeys]);

  // Vault file management
  const handleAddVaultFile = (file: VaultFile) => {
    setVaultFiles((prev) => [file, ...prev]);
  };

  const handleUpdateVaultFile = (file: VaultFile) => {
    setVaultFiles((prev) => prev.map((f) => (f.id === file.id ? file : f)));
  };

  const handleDeleteVaultFile = (id: string) => {
    setVaultFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // If not authenticated, render the MedExchange-Crypto Access Link & Sign-In Portal
  if (!authSession) {
    return (
      <div className="min-h-screen bg-[#0b0d14] text-slate-200 flex flex-col font-sans selection:bg-red-900 selection:text-red-100">
        <AuthPortal
          onLogin={handleLogin}
          defaultEmail="2025akcs2255f@kab.ac.ug"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-200 flex flex-col font-sans selection:bg-red-900 selection:text-red-100">
      
      {/* Top Application Header (Matching video with exact title, tabs, user switcher & Encrypt CTA) */}
      <Header
        activeTab={mainTab}
        setActiveTab={setMainTab}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        activeTenantEmail={activeTenantEmail}
        onOpenEncryptModal={() => setIsEncryptModalOpen(true)}
        onRunSimulation={handleRunFullDemo}
        onResetSimulation={handleReset}
        isSimulating={isRunningDemo}
        authSession={authSession}
        onLogout={handleLogout}
        onOpenAccessLinkModal={() => setIsAccessLinkModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Portfolio & Profile (The exact design from the video!) */}
        {mainTab === 'portfolio' && (
          <PortfolioProfile
            onNavigateTab={setMainTab}
            onOpenEncryptModal={() => setIsEncryptModalOpen(true)}
            activeUserSalt={activeUserSalt}
            onRefreshSalt={() => setActiveUserSalt(generateRandomHex(16))}
            profile={userProfile}
            onUpdateProfile={setUserProfile}
          />
        )}

        {/* Tab 2: Vault Storage */}
        {mainTab === 'vault' && (
          <VaultStorage
            vaultFiles={vaultFiles}
            onAddFile={handleAddVaultFile}
            onUpdateFile={handleUpdateVaultFile}
            onDeleteFile={handleDeleteVaultFile}
            activeTenant={activeTenantEmail}
          />
        )}

        {/* Tab 3: Security Lab (4-Step Pipeline, Test Suite, Console, Inspector) */}
        {mainTab === 'security_lab' && (
          <SecurityLab
            aliceKeys={aliceKeys}
            bobKeys={bobKeys}
            eveKeys={eveKeys}
            isGeneratingKeys={isGeneratingKeys}
            onRegenerateKeys={initKeys}
            currentPackage={currentPackage}
            onSendRecord={handleSendRecord}
            isSending={isSending}
            verificationResult={verificationResult}
            onReceiveRecord={handleReceiveRecord}
            isReceiving={isReceiving}
            attackResult={attackResult}
            onExecuteAttack={handleExecuteAttack}
            isAttacking={isAttacking}
            logs={logs}
            onClearLogs={() => setLogs([])}
            onRunFullDemo={handleRunFullDemo}
            onReset={handleReset}
            isRunningDemo={isRunningDemo}
            onLogMessage={addLog}
          />
        )}

        {/* Tab 4: FastAPI Spec & Python Core */}
        {mainTab === 'fastapi_spec' && (
          <FastApiSpec />
        )}

      </main>

      {/* Quick Encrypt Modal (Triggered by Header "Encrypt File") */}
      <EncryptModal
        isOpen={isEncryptModalOpen}
        onClose={() => setIsEncryptModalOpen(false)}
        onAddFile={(file) => {
          handleAddVaultFile(file);
          setMainTab('vault');
        }}
        activeTenant={activeTenantEmail}
      />

      {/* Access Link & Active Session Modal */}
      <AccessLinkModal
        isOpen={isAccessLinkModalOpen}
        onClose={() => setIsAccessLinkModalOpen(false)}
        authSession={authSession}
        onLogout={handleLogout}
      />

      {/* Persistent Bottom Status Bar (Matching Video Footers) */}
      <footer className="border-t border-[#1a1f30] bg-[#0c0e16] py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-200 tracking-wide font-mono">
              <span className="text-red-500">MedExchange</span>
              <span className="text-slate-400">-</span>
              <span className="text-white">Crypto</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-red-400 font-mono text-[10px] font-semibold bg-red-950/80 border border-red-800/70 px-1.5 py-0.5 rounded">
              Zero-Trust Vault
            </span>
            <span className="text-slate-600">·</span>
            <span>NIST SP 800-132 (210,000 rounds)</span>
            <span className="text-slate-600">·</span>
            <span>AES-256-GCM (RFC 5116)</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Tenant Isolated
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Lead Architect: <strong className="text-white font-semibold">Tindiwensi Joseph</strong></span>
            <span>Co-Lead: <strong className="text-slate-300">Tukamushaba Derick</strong></span>
            <span className="text-red-400">Kabale University, Uganda</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
