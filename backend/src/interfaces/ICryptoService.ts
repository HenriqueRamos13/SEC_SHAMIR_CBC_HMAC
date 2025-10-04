export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  hmac: string;
  key: Buffer;
}

export interface DecryptionResult {
  decryptedData: string;
  verified: boolean;
}

export interface ICryptoService {
  encrypt(data: string): EncryptionResult;
  decrypt(encryptedData: string, iv: string, key: Buffer, hmac: string): DecryptionResult;
  generateShares(secret: string, totalShares: number, threshold: number): string[];
  reconstructSecret(shares: string[]): string;
}
