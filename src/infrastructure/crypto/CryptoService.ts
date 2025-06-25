import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';
import { ICryptoService } from '../../domain/interfaces/ICryptoService';

export class CryptoService implements ICryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly iterations = 100000;

  async encrypt(data: string, password: string): Promise<string> {
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);
    const key = pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha512');
    const cipher = createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();
    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, encrypted]);
    return result.toString('base64');
  }

  async decrypt(encryptedData: string, password: string): Promise<string> {
    const buffer = Buffer.from(encryptedData, 'base64');
    const salt = buffer.subarray(0, this.saltLength);
    const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = buffer.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
    const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);
    const key = pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha512');
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(32);
    const hash = pbkdf2Sync(password, salt, this.iterations, 64, 'sha512');
    return Buffer.concat([salt, hash]).toString('base64');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const buffer = Buffer.from(hash, 'base64');
    const salt = buffer.subarray(0, 32);
    const storedHash = buffer.subarray(32);
    const computedHash = pbkdf2Sync(password, salt, this.iterations, 64, 'sha512');
    return storedHash.equals(computedHash);
  }
} 