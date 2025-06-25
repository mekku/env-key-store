import { FileStorageService } from '../../../infrastructure/storage/FileStorageService';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('FileStorageService', () => {
  let storageService: FileStorageService;
  const testFilePath = '/test/path/store.file';

  beforeEach(() => {
    storageService = new FileStorageService(testFilePath);
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save data to file', async () => {
      const testData = 'test data content';
      const fsPromises = require('fs').promises;

      await storageService.save(testData);

      expect(fsPromises.writeFile).toHaveBeenCalledWith(testFilePath, testData, 'utf8');
    });

    it('should handle empty data', async () => {
      const testData = '';
      const fsPromises = require('fs').promises;

      await storageService.save(testData);

      expect(fsPromises.writeFile).toHaveBeenCalledWith(testFilePath, testData, 'utf8');
    });
  });

  describe('load', () => {
    it('should load data from file', async () => {
      const testData = 'test data content';
      const fsPromises = require('fs').promises;
      fsPromises.readFile.mockResolvedValue(testData);

      const result = await storageService.load();

      expect(fsPromises.readFile).toHaveBeenCalledWith(testFilePath, 'utf8');
      expect(result).toBe(testData);
    });

    it('should throw error when file does not exist', async () => {
      const fsPromises = require('fs').promises;
      fsPromises.readFile.mockRejectedValue(new Error('File not found'));

      await expect(storageService.load()).rejects.toThrow('File not found');
    });
  });

  describe('exists', () => {
    it('should return true when file exists', async () => {
      const fsPromises = require('fs').promises;
      fsPromises.access.mockResolvedValue(undefined);

      const result = await storageService.exists();

      expect(fsPromises.access).toHaveBeenCalledWith(testFilePath);
      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      const fsPromises = require('fs').promises;
      fsPromises.access.mockRejectedValue(new Error('File not found'));

      const result = await storageService.exists();

      expect(fsPromises.access).toHaveBeenCalledWith(testFilePath);
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete file when it exists', async () => {
      const fsPromises = require('fs').promises;
      fsPromises.unlink.mockResolvedValue(undefined);

      await storageService.delete();

      expect(fsPromises.unlink).toHaveBeenCalledWith(testFilePath);
    });

    it('should not throw error when file does not exist', async () => {
      const fsPromises = require('fs').promises;
      fsPromises.unlink.mockRejectedValue(new Error('File not found'));

      await expect(storageService.delete()).resolves.toBeUndefined();
    });
  });
}); 