import { promises as fs } from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { ICryptoService } from '../../domain/interfaces/ICryptoService';

export interface Config {
  storagePath: string;
  encryptedPassword: string;
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
    const encryptedPassword = await this.cryptoService.encrypt(password, this.machineKey);
    const config: Config = {
      storagePath: path.resolve(this.configDir, 'env-store.store'),
      encryptedPassword: encryptedPassword
    };
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async getPassword(): Promise<string> {
    const config = await this.loadConfig();
    return await this.cryptoService.decrypt(config.encryptedPassword, this.machineKey);
  }

  async getStoragePath(): Promise<string> {
    const config = await this.loadConfig();
    return config.storagePath;
  }

  async setStoragePath(storagePath: string): Promise<void> {
    const config = await this.loadConfig();
    // Convert to absolute path
    config.storagePath = path.resolve(storagePath);
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