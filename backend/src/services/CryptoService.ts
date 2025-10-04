import crypto from 'crypto';
import secrets from 'secrets.js-grempe';
import { ICryptoService, EncryptionResult, DecryptionResult } from '../interfaces/ICryptoService';

export class CryptoService implements ICryptoService {
  encrypt(data: string): EncryptionResult {
    const key = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    const hmac = crypto.createHmac('sha512', key);
    hmac.update(encryptedData);
    const hmacDigest = hmac.digest('hex');

    return {
      encryptedData,
      iv: iv.toString('base64'),
      hmac: hmacDigest,
      key,
    };
  }

  decrypt(encryptedData: string, iv: string, key: Buffer, hmac: string): DecryptionResult {
    const hmacCheck = crypto.createHmac('sha512', key);
    hmacCheck.update(encryptedData);
    const computedHmac = hmacCheck.digest('hex');

    if (computedHmac !== hmac) {
      throw new Error('HMAC verification failed');
    }

    const ivBuffer = Buffer.from(iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivBuffer);
    let decryptedData = decipher.update(encryptedData, 'base64', 'utf8');
    decryptedData += decipher.final('utf8');

    return {
      decryptedData,
      verified: true,
    };
  }

  generateShares(secret: string, totalShares: number, threshold: number): string[] {
    return secrets.share(secret, totalShares, threshold);
  }

  reconstructSecret(shares: string[]): string {
    return secrets.combine(shares);
  }
}
