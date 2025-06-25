export interface ICryptoService {
  encrypt(data: string, password: string): Promise<string>;
  decrypt(encryptedData: string, password: string): Promise<string>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
} 