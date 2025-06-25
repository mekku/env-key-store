import { promises as fs } from 'fs';
import { IStorageService } from '../../domain/interfaces/IStorageService';

export class FileStorageService implements IStorageService {
  constructor(private filePath: string) {}

  async save(data: string): Promise<void> {
    await fs.writeFile(this.filePath, data, 'utf8');
  }

  async load(): Promise<string> {
    return await fs.readFile(this.filePath, 'utf8');
  }

  async exists(): Promise<boolean> {
    try {
      await fs.access(this.filePath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(): Promise<void> {
    try {
      await fs.unlink(this.filePath);
    } catch (error) {
      // File doesn't exist, which is fine
    }
  }
} 