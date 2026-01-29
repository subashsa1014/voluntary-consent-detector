// Encryption and security utilities for consent data

// Generate RSA key pair (note: In production, use proper cryptography library)
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  // Placeholder for RSA key generation
  // In production, integrate with 'libp2p-crypto' or 'tweetnacl'
  return {
    publicKey: 'RSA_PUBLIC_KEY_' + Math.random().toString(36).substr(2, 9),
    privateKey: 'RSA_PRIVATE_KEY_' + Math.random().toString(36).substr(2, 9)
  };
}

// Encrypt consent data using AES-256
export async function encryptConsent(data: string, encryptionKey: string): Promise<string> {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const encodedKey = encoder.encode(encryptionKey.padEnd(32, '0').substring(0, 32));

    // Use SubtleCrypto API for encryption (WebCrypto)
    const algorithm = { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) };
    const key = await crypto.subtle.importKey('raw', encodedKey, 'AES-GCM', false, ['encrypt']);
    
    const encrypted = await crypto.subtle.encrypt(algorithm, key, encodedData);
    const encryptedArray = Array.from(new Uint8Array(encrypted));
    const ivArray = Array.from(algorithm.iv);
    
    return JSON.stringify({
      encrypted: encryptedArray,
      iv: ivArray
    });
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt consent data');
  }
}

// Decrypt consent data
export async function decryptConsent(encryptedData: string, encryptionKey: string): Promise<string> {
  try {
    const { encrypted, iv } = JSON.parse(encryptedData);
    
    const encoder = new TextEncoder();
    const encodedKey = encoder.encode(encryptionKey.padEnd(32, '0').substring(0, 32));
    
    const algorithm = { 
      name: 'AES-GCM', 
      iv: new Uint8Array(iv)
    };
    
    const key = await crypto.subtle.importKey('raw', encodedKey, 'AES-GCM', false, ['decrypt']);
    const decrypted = await crypto.subtle.decrypt(algorithm, key, new Uint8Array(encrypted));
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt consent data');
  }
}

// Generate hash for consent records
export async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create digital signature for consent
export async function signConsent(data: string, privateKey: string): Promise<string> {
  // Placeholder for digital signature
  // In production, use proper cryptographic signing
  const hash = await generateHash(data + privateKey);
  return 'SIGNATURE_' + hash.substring(0, 32);
}

// Verify digital signature
export async function verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
  try {
    const expectedSignature = await signConsent(data, publicKey);
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Anonymize personally identifiable information (PII)
export function anonymizePII(data: string): string {
  return data
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX') // SSN
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX') // Credit card
    .replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+)/g, 'XXX@XXX.XXX') // Email
    .replace(/\b\d{10}\b/g, 'XXXXXXXXXX'); // Phone number
}

// Check DPDPA compliance
export function checkDPDPACompliance(consentData: any): { compliant: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!consentData.timestamp) issues.push('Missing timestamp');
  if (!consentData.userConsent) issues.push('Missing explicit user consent');
  if (!consentData.dataUsagePurpose) issues.push('Missing data usage purpose');
  if (!consentData.dataRetentionPeriod) issues.push('Missing data retention period');
  if (!consentData.rightToWithdraw) issues.push('Missing right to withdraw');

  return {
    compliant: issues.length === 0,
    issues
  };
}

export default {
  generateKeyPair,
  encryptConsent,
  decryptConsent,
  generateHash,
  signConsent,
  verifySignature,
  anonymizePII,
  checkDPDPACompliance
};
