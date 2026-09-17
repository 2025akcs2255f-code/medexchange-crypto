export interface SampleMedicalRecord {
  id: string;
  title: string;
  patientName: string;
  dob: string;
  diagnosis: string;
  department: string;
  content: string;
}

export const SAMPLE_RECORDS: SampleMedicalRecord[] = [
  {
    id: 'script-default',
    title: 'Appendicitis Emergency (Python Script Default)',
    patientName: 'John Doe',
    dob: '1985-04-12',
    diagnosis: 'Acute Appendicitis',
    department: 'General Surgery',
    content: `PATIENT: John Doe | DOB: 1985-04-12\nDIAGNOSIS: Acute Appendicitis\nPRESCRIPTION: Amoxicillin 500mg, Paracetamol 1g\nNOTE: Requires urgent surgical consultation.`
  },
  {
    id: 'cardio-stent',
    title: 'Cardiology - Post-PCI Stent Protocol',
    patientName: 'Elena Rostova',
    dob: '1968-11-23',
    diagnosis: 'Coronary Artery Disease (s/p LAD Stent)',
    department: 'Cardiovascular Medicine',
    content: `PATIENT: Elena Rostova | DOB: 1968-11-23 | MRN: #CR-88291\nDIAGNOSIS: Non-ST-Segment Elevation Myocardial Infarction\nPROCEDURE: Percutaneous Coronary Intervention with Drug-Eluting Stent\nMEDICATIONS: Ticagrelor 90mg BID, Atorvastatin 80mg QHS, Metoprolol 25mg BID\nVITALS: BP 118/74 mmHg, HR 64 bpm, SpO2 99%\nCONFIDENTIAL: Telemetry continuous monitoring through 48h post-op.`
  },
  {
    id: 'neuro-oncology',
    title: 'Neurology - High-Field MRI Cranial Study',
    patientName: 'Marcus Vance',
    dob: '1979-02-14',
    diagnosis: 'Atypical Glioblastoma (Grade IV Candidate)',
    department: 'Neuroradiology & Oncology',
    content: `PATIENT: Marcus Vance | DOB: 1979-02-14 | MRN: #NR-44019\nCLINICAL INDICATION: Intractable nocturnal migraines, right-sided motor deficit\nIMAGING: 3T MRI Cranium with IV Gadoterate Meglumine\nFINDINGS: 3.2cm heterogeneously enhancing infiltrative intra-axial lesion in left frontoparietal lobe with 4mm midline shift\nRECOMMENDATION: Stereotactic guided biopsy; initiate Dexamethasone 4mg q6h.`
  },
  {
    id: 'pediatric-allergy',
    title: 'Pediatrics - Anaphylaxis Critical Alert',
    patientName: 'Aria Chen',
    dob: '2018-08-05',
    diagnosis: 'Severe Peanut & Tree Nut Anaphylaxis (IgE > 100 kU/L)',
    department: 'Pediatric Allergy & Immunology',
    content: `PATIENT: Aria Chen | DOB: 2018-08-05 | MRN: #PA-10294\nALLERGY PROFILE: Class VI Peanut Protein, Cashew, Pistachio\nEMERGENCY PROTOCOL: Epinephrine Auto-Injector 0.15mg IM lateral thigh immediately upon suspected ingestion\nFOLLOW-UP: Referral to pediatric immunotherapy desensitization clinical trial.`
  }
];

export const PYTHON_SCRIPT_CODE = `import os
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag, InvalidSignature

# =====================================================================
# SYSTEM SETUP & KEY MANAGEMENT
# =====================================================================
def generate_rsa_keypair():
    """Generates an RSA-2048 keypair for asymmetric operations."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    public_key = private_key.public_key()
    return private_key, public_key


# =====================================================================
# SENDER OPERATIONS (Tukamushaba Derick)
# =====================================================================
def send_medical_record(sender_private_key, receiver_public_key, medical_record_bytes):
    """
    Protects medical record using:
    1. NON-REPUDIATION: Digital Signature (RSA-PSS)
    2. CONFIDENTIALITY & INTEGRITY: AES-256-GCM Payload Encryption
    3. CONFIDENTIALITY: RSA-OAEP Key Wrapping
    """
    # Defensive type check: automatically coerce str to UTF-8 bytes
    if isinstance(medical_record_bytes, str):
        medical_record_bytes = medical_record_bytes.encode('utf-8')
    elif not isinstance(medical_record_bytes, (bytes, bytearray)):
        raise TypeError("medical_record_bytes must be bytes or str")

    # 1. NON-REPUDIATION: Sign the original record with Sender's Private Key
    signature = sender_private_key.sign(
        medical_record_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    # Bundle record and signature together for protection
    # Format: [4 bytes signature length] + [signature] + [medical record]
    sig_len = len(signature).to_bytes(4, byteorder='big')
    payload = sig_len + signature + medical_record_bytes

    # 2. CONFIDENTIALITY & INTEGRITY: Generate random AES-256 key & encrypt payload
    aes_key = AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(aes_key)
    nonce = os.urandom(12)  # 96-bit nonce for AES-GCM
    ciphertext = aesgcm.encrypt(nonce, payload, associated_data=None)

    # 3. CONFIDENTIALITY: Encrypt (wrap) AES key using Receiver's Public Key
    encrypted_aes_key = receiver_public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    # Package into transaction bundle
    crypto_package = {
        "nonce": nonce,
        "ciphertext": ciphertext,
        "encrypted_aes_key": encrypted_aes_key
    }
    return crypto_package


# =====================================================================
# RECEIVER OPERATIONS (Tindiwensi Joseph)
# =====================================================================
def receive_medical_record(receiver_private_key, sender_public_key, crypto_package):
    """
    Decrypts and verifies medical record:
    1. CONFIDENTIALITY: Decrypts AES key using Receiver's Private Key
    2. INTEGRITY: AES-GCM tag validation during decryption
    3. AUTHENTICATION & NON-REPUDIATION: Verifies Digital Signature
    """
    if not isinstance(crypto_package, dict):
        raise TypeError("crypto_package must be a dictionary")
    for key in ("nonce", "ciphertext", "encrypted_aes_key"):
        if key not in crypto_package:
            raise KeyError(f"crypto_package missing required key '{key}'")

    nonce = crypto_package["nonce"]
    ciphertext = crypto_package["ciphertext"]
    encrypted_aes_key = crypto_package["encrypted_aes_key"]

    # 1. CONFIDENTIALITY: Decrypt AES key using Receiver's Private Key
    aes_key = receiver_private_key.decrypt(
        encrypted_aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    # 2. INTEGRITY & CONFIDENTIALITY: Decrypt ciphertext
    # Throws InvalidTag exception automatically if data or tag was tampered with
    aesgcm = AESGCM(aes_key)
    decrypted_payload = aesgcm.decrypt(nonce, ciphertext, associated_data=None)

    # Defensive bounds checking for binary payload
    if len(decrypted_payload) < 4:
        raise ValueError("Decrypted payload truncated: missing signature length header")

    sig_len = int.from_bytes(decrypted_payload[:4], byteorder='big')
    if len(decrypted_payload) < 4 + sig_len:
        raise ValueError(f"Decrypted payload corrupted: expected {sig_len} bytes signature")

    signature = decrypted_payload[4:4 + sig_len]
    medical_record_bytes = decrypted_payload[4 + sig_len:]

    # 3. AUTHENTICATION & NON-REPUDIATION: Verify signature with Sender's Public Key
    # Throws InvalidSignature exception if sender key mismatch or hash mismatch
    sender_public_key.verify(
        signature,
        medical_record_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    return medical_record_bytes.decode('utf-8')


# =====================================================================
# AUTOMATED TESTING SUITE & DEMONSTRATION
# =====================================================================
def run_all_tests():
    print("=" * 65)
    print(" MedExchange-Crypto System Automated Diagnostic Test Suite")
    print("=" * 65)

    passed = 0
    total = 0

    # Test 1: Key Generation
    total += 1
    alice_priv, alice_pub = generate_rsa_keypair()
    bob_priv, bob_pub = generate_rsa_keypair()
    eve_priv, eve_pub = generate_rsa_keypair()
    assert alice_priv.key_size == 2048 and bob_priv.key_size == 2048
    print("[PASS] Test 1: RSA-2048 Keypairs successfully generated.")
    passed += 1

    # Test 2: Standard End-to-End Transmission
    total += 1
    sample_record = (
        "PATIENT: John Doe | DOB: 1985-04-12\\n"
        "DIAGNOSIS: Acute Appendicitis\\n"
        "PRESCRIPTION: Amoxicillin 500mg, Paracetamol 1g\\n"
        "NOTE: Requires urgent surgical consultation."
    )
    pkg = send_medical_record(alice_priv, bob_pub, sample_record)
    decrypted = receive_medical_record(bob_priv, alice_pub, pkg)
    assert decrypted == sample_record
    print("[PASS] Test 2: End-to-End Transmission, Decryption & Signature Verified.")
    passed += 1

    # Test 3: Unicode & Clinical Units Preservation
    total += 1
    u_record = "PATIENT: José Müller | DOSAGE: 250µg ± 0.5 mL | TEMP: 38.6°C | RX: α-blocker"
    u_pkg = send_medical_record(alice_priv, bob_pub, u_record)
    u_dec = receive_medical_record(bob_priv, alice_pub, u_pkg)
    assert u_dec == u_record
    print("[PASS] Test 3: Unicode & Special Medical Symbols preserved.")
    passed += 1

    # Test 4: MITM Tamper Defense (Step 4 Demo)
    total += 1
    tampered_ct = bytearray(pkg["ciphertext"])
    tampered_ct[10] ^= 0xFF
    tampered_pkg = {
        "nonce": pkg["nonce"],
        "ciphertext": bytes(tampered_ct),
        "encrypted_aes_key": pkg["encrypted_aes_key"]
    }
    try:
        receive_medical_record(bob_priv, alice_pub, tampered_pkg)
        print("[FAIL] Test 4: Tampered ciphertext was NOT detected!")
    except InvalidTag:
        print("[PASS] Test 4: MITM Ciphertext tamper caught by InvalidTag (Integrity Check)!")
        passed += 1

    # Test 5: Wrapped Key Tamper Defense
    total += 1
    tampered_key = bytearray(pkg["encrypted_aes_key"])
    tampered_key[5] ^= 0xFF
    bad_key_pkg = {
        "nonce": pkg["nonce"],
        "ciphertext": pkg["ciphertext"],
        "encrypted_aes_key": bytes(tampered_key)
    }
    try:
        receive_medical_record(bob_priv, alice_pub, bad_key_pkg)
        print("[FAIL] Test 5: Tampered wrapped key was NOT detected!")
    except (ValueError, Exception) as e:
        print(f"[PASS] Test 5: Tampered wrapped key caught: {type(e).__name__} (OAEP Defense)!")
        passed += 1

    # Test 6: Nonce Corruption
    total += 1
    tampered_nonce = bytearray(pkg["nonce"])
    tampered_nonce[0] ^= 0x55
    bad_nonce_pkg = {
        "nonce": bytes(tampered_nonce),
        "ciphertext": pkg["ciphertext"],
        "encrypted_aes_key": pkg["encrypted_aes_key"]
    }
    try:
        receive_medical_record(bob_priv, alice_pub, bad_nonce_pkg)
        print("[FAIL] Test 6: Corrupted nonce was NOT detected!")
    except InvalidTag:
        print("[PASS] Test 6: Corrupted nonce caught by InvalidTag!")
        passed += 1

    # Test 7: Imposter Identity Defense
    total += 1
    try:
        receive_medical_record(bob_priv, eve_pub, pkg)
        print("[FAIL] Test 7: Imposter sender key was NOT detected!")
    except InvalidSignature:
        print("[PASS] Test 7: Imposter sender key caught by InvalidSignature!")
        passed += 1

    print("-" * 65)
    print(f"Results: {passed}/{total} automated tests passed successfully.")
    print("-" * 65)
    return passed == total


if __name__ == "__main__":
    run_all_tests()
`;
