import { ProjectService } from '../../../domain/services/ProjectService';
import { ICryptoService } from '../../../domain/interfaces/ICryptoService';
import { IStorageService } from '../../../domain/interfaces/IStorageService';

// Mock interfaces
const mockCryptoService: jest.Mocked<ICryptoService> = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
};

const mockStorageService: jest.Mocked<IStorageService> = {
  save: jest.fn(),
  load: jest.fn(),
  exists: jest.fn(),
  delete: jest.fn(),
};

describe('ProjectService', () => {
  let projectService: ProjectService;
  const testPassword = 'test-password';

  beforeEach(() => {
    projectService = new ProjectService(mockCryptoService, mockStorageService);
    jest.clearAllMocks();
  });

  describe('setSecrets', () => {
    it('should set secrets for a new project', async () => {
      const projectName = 'testProject';
      const secrets = { API_KEY: 'test-key', DATABASE_URL: 'postgres://test' };
      
      mockStorageService.exists.mockResolvedValue(false);
      mockCryptoService.encrypt.mockResolvedValue('encrypted-data');

      await projectService.setSecrets(projectName, secrets, testPassword);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        expect.stringContaining('testProject'),
        testPassword
      );
      expect(mockStorageService.save).toHaveBeenCalledWith('encrypted-data');
    });

    it('should update existing project secrets', async () => {
      const projectName = 'existingProject';
      const newSecrets = { NEW_KEY: 'new-value' };
      
      const existingStore = {
        projects: {
          existingProject: {
            name: 'existingProject',
            secrets: { OLD_KEY: 'old-value' },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-existing-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(existingStore));
      mockCryptoService.encrypt.mockResolvedValue('encrypted-updated-data');

      await projectService.setSecrets(projectName, newSecrets, testPassword);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        expect.stringContaining('NEW_KEY'),
        testPassword
      );
    });
  });

  describe('addSecrets', () => {
    it('should add secrets to existing project', async () => {
      const projectName = 'existingProject';
      const newSecrets = { NEW_KEY: 'new-value' };
      
      const existingStore = {
        projects: {
          existingProject: {
            name: 'existingProject',
            secrets: { OLD_KEY: 'old-value' },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-existing-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(existingStore));
      mockCryptoService.encrypt.mockResolvedValue('encrypted-merged-data');

      await projectService.addSecrets(projectName, newSecrets, testPassword);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        expect.stringContaining('OLD_KEY'),
        testPassword
      );
      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        expect.stringContaining('NEW_KEY'),
        testPassword
      );
    });
  });

  describe('getSecrets', () => {
    it('should return project secrets', async () => {
      const projectName = 'testProject';
      const expectedSecrets = { API_KEY: 'test-key', DATABASE_URL: 'postgres://test' };
      
      const store = {
        projects: {
          testProject: {
            name: 'testProject',
            secrets: expectedSecrets,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(store));

      const result = await projectService.getSecrets(projectName, testPassword);

      expect(result).toEqual(expectedSecrets);
    });

    it('should throw error when project not found', async () => {
      const projectName = 'nonExistentProject';
      
      const store = {
        projects: {},
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(store));

      await expect(projectService.getSecrets(projectName, testPassword))
        .rejects.toThrow(`Project '${projectName}' not found`);
    });
  });

  describe('listProjects', () => {
    it('should return list of project names', async () => {
      const store = {
        projects: {
          project1: { name: 'project1', secrets: {}, createdAt: new Date(), updatedAt: new Date() },
          project2: { name: 'project2', secrets: {}, createdAt: new Date(), updatedAt: new Date() },
        },
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(store));

      const result = await projectService.listProjects(testPassword);

      expect(result).toEqual(['project1', 'project2']);
    });

    it('should return empty array when no projects exist', async () => {
      const store = {
        projects: {},
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(store));

      const result = await projectService.listProjects(testPassword);

      expect(result).toEqual([]);
    });
  });

  describe('removeSecrets', () => {
    it('should remove specified keys from project', async () => {
      const projectName = 'testProject';
      const keysToRemove = ['API_KEY', 'DATABASE_URL'];
      
      const existingStore = {
        projects: {
          testProject: {
            name: 'testProject',
            secrets: { 
              API_KEY: 'test-key', 
              DATABASE_URL: 'postgres://test',
              KEEP_KEY: 'keep-value'
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(existingStore));
      mockCryptoService.encrypt.mockResolvedValue('encrypted-updated-data');

      await projectService.removeSecrets(projectName, keysToRemove, testPassword);

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        expect.stringContaining('KEEP_KEY'),
        testPassword
      );
      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        expect.not.stringContaining('API_KEY'),
        testPassword
      );
    });

    it('should throw error when project not found', async () => {
      const projectName = 'nonExistentProject';
      const keysToRemove = ['API_KEY'];
      
      const store = {
        projects: {},
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(store));

      await expect(projectService.removeSecrets(projectName, keysToRemove, testPassword))
        .rejects.toThrow(`Project '${projectName}' not found`);
    });
  });

  describe('reEncryptStore', () => {
    it('should re-encrypt store with new password', async () => {
      const oldPassword = 'old-password';
      const newPassword = 'new-password';
      
      const store = {
        projects: {
          testProject: {
            name: 'testProject',
            secrets: { API_KEY: 'test-key' },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
        version: '1.0.0',
      };

      mockStorageService.exists.mockResolvedValue(true);
      mockStorageService.load.mockResolvedValue('encrypted-old-data');
      mockCryptoService.decrypt.mockResolvedValue(JSON.stringify(store));
      mockCryptoService.encrypt.mockResolvedValue('encrypted-new-data');

      await projectService.reEncryptStore(oldPassword, newPassword);

      expect(mockCryptoService.decrypt).toHaveBeenCalledWith('encrypted-old-data', oldPassword);
      expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
        JSON.stringify(store, null, 2),
        newPassword
      );
      expect(mockStorageService.save).toHaveBeenCalledWith('encrypted-new-data');
    });
  });
}); 