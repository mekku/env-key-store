import { CryptoService } from '../../../infrastructure/crypto/CryptoService';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = new CryptoService();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const testData = 'Hello, World!';
      const password = 'test-password-123';

      const encrypted = await cryptoService.encrypt(testData, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);

      expect(decrypted).toBe(testData);
      expect(encrypted).not.toBe(testData);
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 format
    });

    it('should encrypt same data differently each time', async () => {
      const testData = 'Hello, World!';
      const password = 'test-password-123';

      const encrypted1 = await cryptoService.encrypt(testData, password);
      const encrypted2 = await cryptoService.encrypt(testData, password);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should fail to decrypt with wrong password', async () => {
      const testData = 'Hello, World!';
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';

      const encrypted = await cryptoService.encrypt(testData, correctPassword);

      await expect(cryptoService.decrypt(encrypted, wrongPassword)).rejects.toThrow();
    });

    it('should handle empty string', async () => {
      const testData = '';
      const password = 'test-password-123';

      const encrypted = await cryptoService.encrypt(testData, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);

      expect(decrypted).toBe(testData);
    });

    it('should handle special characters', async () => {
      const testData = 'Hello, 世界! 🚀\n\t\r';
      const password = 'test-password-123';

      const encrypted = await cryptoService.encrypt(testData, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);

      expect(decrypted).toBe(testData);
    });

    it('should handle large data', async () => {
      const testData = 'A'.repeat(10000);
      const password = 'test-password-123';

      const encrypted = await cryptoService.encrypt(testData, password);
      const decrypted = await cryptoService.decrypt(encrypted, password);

      expect(decrypted).toBe(testData);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash password and verify correctly', async () => {
      const password = 'test-password-123';

      const hash = await cryptoService.hashPassword(password);
      const isValid = await cryptoService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 format
    });

    it('should fail verification with wrong password', async () => {
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';

      const hash = await cryptoService.hashPassword(correctPassword);
      const isValid = await cryptoService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should hash same password differently each time', async () => {
      const password = 'test-password-123';

      const hash1 = await cryptoService.hashPassword(password);
      const hash2 = await cryptoService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const password = '';

      const hash = await cryptoService.hashPassword(password);
      const isValid = await cryptoService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error when decrypting invalid data', async () => {
      const invalidData = 'invalid-base64-data!@#';
      const password = 'test-password-123';

      await expect(cryptoService.decrypt(invalidData, password)).rejects.toThrow();
    });

    it('should throw error when decrypting with corrupted data', async () => {
      const testData = 'Hello, World!';
      const password = 'test-password-123';

      const encrypted = await cryptoService.encrypt(testData, password);
      const corrupted = encrypted.slice(0, -10); // Remove last 10 characters

      await expect(cryptoService.decrypt(corrupted, password)).rejects.toThrow();
    });
  });
}); 