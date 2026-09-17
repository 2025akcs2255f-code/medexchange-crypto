import { useState } from 'react';
import {
  FileCode,
  Terminal,
  Copy,
  Check,
  Download,
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  Server
} from 'lucide-react';

const FASTAPI_PYTHON_CODE = `"""
Zero-Trust Encrypted File Vault - FastAPI Cryptographic Core
Standard-reference implementation compliant with NIST SP 800-132 & RFC 5116.
Authors: Tindiwensi Joseph & Tukamushaba Derick
Institution: Kabale University, Uganda
"""

import os
import base64
from fastapi import FastAPI, HTTPException, Header, status
from pydantic import BaseModel, Field
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidTag

app = FastAPI(
    title="Zero-Trust Encrypted File Vault API",
    version="1.0.0",
    description="Production-grade AES-256-GCM + PBKDF2 (210,000 rounds) cryptographic microservice"
)

# Configuration: NIST SP 800-132 Standards
PBKDF2_ITERATIONS = 210000
KEY_SIZE_BYTES = 32     # 256 bits for AES-256
NONCE_SIZE_BYTES = 12   # 96 bits for RFC 5116 AES-GCM
SALT_SIZE_BYTES = 16    # 128 bits cryptographic salt


def derive_aes_key(passphrase: str, salt: bytes) -> bytes:
    """
    Derives an ephemeral 256-bit symmetric key using PBKDF2-HMAC-SHA256.
    Key exists exclusively in volatile memory and is never persisted.
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_SIZE_BYTES,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )
    return kdf.derive(passphrase.encode('utf-8'))


# ==========================================
# Pydantic Request & Response Schemas
# ==========================================
class EncryptRequest(BaseModel):
    plaintext: str = Field(..., description="Plaintext or clinical data to encrypt")
    passphrase: str = Field(..., min_length=12, description="Master secret passphrase")
    filename: str = Field("record.enc", description="Sanitized filename")


class EncryptResponse(BaseModel):
    filename: str
    salt_hex: str
    nonce_hex: str
    ciphertext_base64: str
    tag_hex: str
    algorithm: str = "AES-256-GCM"
    iterations: int = PBKDF2_ITERATIONS
    tenant_id: str


class DecryptRequest(BaseModel):
    salt_hex: str
    nonce_hex: str
    ciphertext_base64: str
    passphrase: str


class DecryptResponse(BaseModel):
    plaintext: str
    authenticated: bool
    status: str = "GHASH Tag Verified"


# ==========================================
# REST API Endpoints
# ==========================================
@app.post("/api/v1/vault/encrypt", response_model=EncryptResponse)
async def encrypt_file(req: EncryptRequest, x_tenant_id: str = Header(default="2025akcs2255f@kab.ac.ug")):
    """
    Encrypts payload using ephemeral AES-256-GCM with fresh CSPRNG salt & nonce.
    Appends 16-byte GHASH authentication tag for AEAD integrity guarantee.
    """
    salt = os.urandom(SALT_SIZE_BYTES)
    nonce = os.urandom(NONCE_SIZE_BYTES)

    # In-memory key derivation
    key = derive_aes_key(req.passphrase, salt)
    aesgcm = AESGCM(key)

    plaintext_bytes = req.plaintext.encode('utf-8')
    # AESGCM.encrypt appends 16-byte authentication tag to ciphertext
    ciphertext = aesgcm.encrypt(nonce, plaintext_bytes, associated_data=x_tenant_id.encode('utf-8'))

    # Extract the 16-byte GHASH tag (last 16 bytes)
    tag = ciphertext[-16:]

    return EncryptResponse(
        filename=req.filename,
        salt_hex=salt.hex(),
        nonce_hex=nonce.hex(),
        ciphertext_base64=base64.b64encode(ciphertext).decode('utf-8'),
        tag_hex=tag.hex(),
        tenant_id=x_tenant_id,
    )


@app.post("/api/v1/vault/decrypt", response_model=DecryptResponse)
async def decrypt_file(req: DecryptRequest, x_tenant_id: str = Header(default="2025akcs2255f@kab.ac.ug")):
    """
    Decrypts and authenticates ciphertext.
    Rejects any modified ciphertext or tampered tag with HTTP 400 InvalidTag.
    """
    try:
        salt = bytes.fromhex(req.salt_hex)
        nonce = bytes.fromhex(req.nonce_hex)
        ciphertext = base64.b64decode(req.ciphertext_base64)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hex/base64 encoding")

    # Re-derive key
    key = derive_aes_key(req.passphrase, salt)
    aesgcm = AESGCM(key)

    try:
        # Reconstruct and authenticate GHASH polynomial
        decrypted_bytes = aesgcm.decrypt(
            nonce, 
            ciphertext, 
            associated_data=x_tenant_id.encode('utf-8')
        )
        return DecryptResponse(
            plaintext=decrypted_bytes.decode('utf-8'),
            authenticated=True
        )
    except InvalidTag:
        # AEAD Tamper Protection: Bit alteration detected
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AEAD Authentication Failed: InvalidTag. Payload was tampered on disk or wrong passphrase."
        )


@app.get("/api/v1/vault/health")
async def health_check():
    return {
        "status": "operational",
        "cipher": "AES-256-GCM",
        "kdf": "PBKDF2-HMAC-SHA256",
        "iterations": PBKDF2_ITERATIONS,
        "lead_architect": "Tindiwensi Joseph",
        "co_lead": "Tukamushaba Derick",
        "institution": "Kabale University, Uganda"
    }
`;

const CURL_EXAMPLES = [
  {
    title: '1. Encrypt Payload & Generate AEAD GHASH Tag',
    description: 'Sends plaintext data to be encrypted into an authenticated AES-256-GCM package.',
    curl: `curl -X POST "https://vault.kab.ac.ug/api/v1/vault/encrypt" \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-Id: 2025akcs2255f@kab.ac.ug" \\
  -d '{
    "plaintext": "CONFIDENTIAL: Patient diagnosis confirms stable cardiac recovery.",
    "passphrase": "NIST-SP-800-132-SecurePassphrase-2026!",
    "filename": "clinical_summary.enc"
  }'`,
  },
  {
    title: '2. Authenticate & Decrypt Verified Ciphertext',
    description: 'Supplies ciphertext and authentication parameters to recover plaintext.',
    curl: `curl -X POST "https://vault.kab.ac.ug/api/v1/vault/decrypt" \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-Id: 2025akcs2255f@kab.ac.ug" \\
  -d '{
    "salt_hex": "4f9b2c8a11e40023a9b1c2d3e4f50617",
    "nonce_hex": "0123456789abcdef01234567",
    "ciphertext_base64": "q8xP3K9...",
    "passphrase": "NIST-SP-800-132-SecurePassphrase-2026!"
  }'`,
  },
  {
    title: '3. Verify AEAD Tamper Detection (Simulated Bit-Flip)',
    description: 'Demonstrates HTTP 400 InvalidTag rejection when an attacker modifies a single ciphertext byte.',
    curl: `curl -X POST "https://vault.kab.ac.ug/api/v1/vault/decrypt" \\
  -H "Content-Type: application/json" \\
  -H "X-Tenant-Id: 2025akcs2255f@kab.ac.ug" \\
  -d '{
    "salt_hex": "4f9b2c8a11e40023a9b1c2d3e4f50617",
    "nonce_hex": "0123456789abcdef01234567",
    "ciphertext_base64": "TAMPERED_BYTE_EXACT_FAILURE",
    "passphrase": "NIST-SP-800-132-SecurePassphrase-2026!"
  }'
# Response: HTTP 400 Bad Request
# {"detail": "AEAD Authentication Failed: InvalidTag. Payload was tampered on disk or wrong passphrase."}`,
  },
];

export const FastApiSpec = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'curl' | 'standards'>('python');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([FASTAPI_PYTHON_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medexchange_crypto_vault_api.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2435]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  MedExchange-Crypto FastAPI Core
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                  Python 3.11 / Cryptography
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard-reference microservice: <code className="text-cyan-300 font-mono">cryptography.hazmat.primitives.ciphers.aead.AESGCM</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(FASTAPI_PYTHON_CODE)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181d2c] hover:bg-[#22293c] text-slate-300 border border-[#2b354d] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Python Code' : 'Copy Code'}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .py
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'python'
                ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Python Backend (server.py)
          </button>

          <button
            onClick={() => setActiveTab('curl')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'curl'
                ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            API Endpoints & cURL Commands
          </button>

          <button
            onClick={() => setActiveTab('standards')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'standards'
                ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Standards & NIST Compliance
          </button>
        </div>
      </div>

      {/* Code / Content Display */}
      {activeTab === 'python' && (
        <div className="bg-[#0c0e16] border border-[#1e2436] rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#131724] border-b border-[#1f2638] text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 text-white font-medium">zero_trust_vault_api.py</span>
            </span>
            <span>NIST SP 800-132 / RFC 5116</span>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">
            {FASTAPI_PYTHON_CODE}
          </pre>
        </div>
      )}

      {activeTab === 'curl' && (
        <div className="space-y-4">
          {CURL_EXAMPLES.map((item, idx) => (
            <div key={idx} className="bg-[#11141f] border border-[#202637] rounded-xl p-4 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-mono">{item.title}</h3>
                <button
                  onClick={() => handleCopy(item.curl)}
                  className="text-xs text-slate-400 hover:text-cyan-300 transition cursor-pointer flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <p className="text-xs text-slate-400">{item.description}</p>
              <pre className="p-3 bg-[#0a0c13] rounded-lg border border-[#1f2537] text-cyan-300 text-xs font-mono overflow-x-auto">
                {item.curl}
              </pre>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'standards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              NIST SP 800-132 Specification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recommendation for Password-Based Key Derivation: Specifies PBKDF2 with a minimum iteration count of 210,000 for HMAC-SHA256 to resist GPU/ASIC accelerated dictionary attacks.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-[#1f2537]">
              <li>• <strong>Salt Length:</strong> 128 bits (16 bytes) cryptographically generated per-record.</li>
              <li>• <strong>HMAC Hash:</strong> SHA-256 (256-bit digest output).</li>
              <li>• <strong>Key Size:</strong> 256 bits (32 bytes) symmetric key.</li>
            </ul>
          </div>

          <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              RFC 5116: AEAD & GHASH Authentication
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An Interface and Algorithms for Authenticated Encryption: AES-256-GCM combines Galois counter mode with Galois/Counter authentication tag (GHASH) to ensure both confidentiality and strict integrity.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-[#1f2537]">
              <li>• <strong>Nonce Length:</strong> 96 bits (12 bytes) fresh CSPRNG nonce per payload.</li>
              <li>• <strong>Authentication Tag:</strong> 128 bits (16 bytes) GHASH polynomial.</li>
              <li>• <strong>Tamper Reaction:</strong> Immediate <code className="text-red-300 font-mono">InvalidTag</code> exception rejection.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
