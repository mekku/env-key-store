import { promises as fs } from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { ICryptoService } from '../../domain/interfaces/ICryptoService';

export interface Config {
  storagePath: string;
  encryptedPasswordHash: string;
}

export class ConfigService {
  private readonly configDir = path.join(homedir(), '.env-store');
  private readonly configPath = path.join(this.configDir, 'config.json');
  private readonly machineKey = 'machine-key';

  constructor(private cryptoService: ICryptoService) {}

  async initialize(): Promise<void> {
    await this.ensureConfigDir();
  }

  async setPassword(password: string): Promise<void> {
    await this.ensureConfigDir();
    const hashedPassword = await this.cryptoService.hashPassword(password);
    const config: Config = {
      storagePath: path.join(this.configDir, 'env-store.store'),
      encryptedPasswordHash: hashedPassword
    };
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async verifyPassword(password: string): Promise<boolean> {
    const config = await this.loadConfig();
    return await this.cryptoService.verifyPassword(password, config.encryptedPasswordHash);
  }

  async getStoragePath(): Promise<string> {
    const config = await this.loadConfig();
    return config.storagePath;
  }

  async setStoragePath(storagePath: string): Promise<void> {
    const config = await this.loadConfig();
    config.storagePath = storagePath;
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async isInitialized(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(this.configDir);
    } catch {
      await fs.mkdir(this.configDir, { recursive: true });
    }
  }

  private async loadConfig(): Promise<Config> {
    const data = await fs.readFile(this.configPath, 'utf8');
    return JSON.parse(data);
  }
} 