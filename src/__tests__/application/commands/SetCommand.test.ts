import { SetCommand } from '../../../application/commands/SetCommand';
import { ConfigService } from '../../../infrastructure/config/ConfigService';
import { FileStorageService } from '../../../infrastructure/storage/FileStorageService';
import { CryptoService } from '../../../infrastructure/crypto/CryptoService';

// Mock dependencies
jest.mock('../../../infrastructure/config/ConfigService');
jest.mock('../../../infrastructure/storage/FileStorageService');
jest.mock('../../../infrastructure/crypto/CryptoService');

describe('SetCommand', () => {
  let setCommand: SetCommand;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockStorageService: jest.Mocked<FileStorageService>;
  let mockCryptoService: jest.Mocked<CryptoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfigService = {
      initialize: jest.fn(),
      isInitialized: jest.fn(),
      getPassword: jest.fn(),
      getStoragePathForFile: jest.fn(),
    } as any;

    mockStorageService = {
      save: jest.fn(),
      load: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockCryptoService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    } as any;

    (ConfigService as jest.Mock).mockImplementation(() => mockConfigService);
    (FileStorageService as jest.Mock).mockImplementation(() => mockStorageService);
    (CryptoService as jest.Mock).mockImplementation(() => mockCryptoService);

    setCommand = new SetCommand();
  });

  describe('execute', () => {
    it('should set secrets successfully', async () => {
      const projectName = 'testProject';
      const secrets = ['API_KEY=test-key', 'DATABASE_URL=postgres://test'];
      const password = 'test-password';
      const storagePath = '/test/path/store';

      mockConfigService.isInitialized.mockResolvedValue(true);
      mockConfigService.getPassword.mockResolvedValue(password);
      mockConfigService.getStoragePathForFile.mockResolvedValue(storagePath);

      await setCommand.execute(projectName, secrets);

      expect(mockConfigService.initialize).toHaveBeenCalled();
      expect(mockConfigService.isInitialized).toHaveBeenCalled();
      expect(mockConfigService.getPassword).toHaveBeenCalled();
      expect(mockConfigService.getStoragePathForFile).toHaveBeenCalledWith(undefined);
    });

    it('should use custom store path and password', async () => {
      const projectName = 'testProject';
      const secrets = ['API_KEY=test-key'];
      const customStorePath = '/custom/path/store';
      const customPassword = 'custom-password';
      const storagePath = '/custom/path/store';

      mockConfigService.isInitialized.mockResolvedValue(true);
      mockConfigService.getStoragePathForFile.mockResolvedValue(storagePath);

      await setCommand.execute(projectName, secrets, customStorePath, customPassword);

      expect(mockConfigService.getStoragePathForFile).toHaveBeenCalledWith(customStorePath);
    });

    it('should throw error when not initialized', async () => {
      const projectName = 'testProject';
      const secrets = ['API_KEY=test-key'];

      mockConfigService.isInitialized.mockResolvedValue(false);

      await expect(setCommand.execute(projectName, secrets))
        .rejects.toThrow('Store is not initialized. Please run "env-store init" first.');
    });

    it('should throw error for invalid secret format', async () => {
      const projectName = 'testProject';
      const secrets = ['INVALID_FORMAT'];
      const password = 'test-password';
      const storagePath = '/test/path/store';

      mockConfigService.isInitialized.mockResolvedValue(true);
      mockConfigService.getPassword.mockResolvedValue(password);
      mockConfigService.getStoragePathForFile.mockResolvedValue(storagePath);

      await expect(setCommand.execute(projectName, secrets))
        .rejects.toThrow('Invalid secret format: INVALID_FORMAT. Expected format: KEY=value');
    });

    it('should throw error for empty key', async () => {
      const projectName = 'testProject';
      const secrets = ['=value'];
      const password = 'test-password';
      const storagePath = '/test/path/store';

      mockConfigService.isInitialized.mockResolvedValue(true);
      mockConfigService.getPassword.mockResolvedValue(password);
      mockConfigService.getStoragePathForFile.mockResolvedValue(storagePath);

      await expect(setCommand.execute(projectName, secrets))
        .rejects.toThrow('Invalid secret format: =value. Expected format: KEY=value');
    });

    it('should throw error for empty value', async () => {
      const projectName = 'testProject';
      const secrets = ['KEY='];
      const password = 'test-password';
      const storagePath = '/test/path/store';

      mockConfigService.isInitialized.mockResolvedValue(true);
      mockConfigService.getPassword.mockResolvedValue(password);
      mockConfigService.getStoragePathForFile.mockResolvedValue(storagePath);

      await expect(setCommand.execute(projectName, secrets))
        .rejects.toThrow('Invalid secret format: KEY=. Expected format: KEY=value');
    });
  });
}); 