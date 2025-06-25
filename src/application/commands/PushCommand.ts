import { promises as fs } from 'fs';
import { ProjectService } from '../../domain/services/ProjectService';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

function parseEnv(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

export class PushCommand {
  private projectService?: ProjectService;
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(projectName: string, envFile: string, customStorePath?: string, customPassword?: string): Promise<void> {
    await this.configService.initialize();
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-store init" first.');
    }
    const password = customPassword || await this.configService.getPassword();
    const storagePath = await this.configService.getStoragePathForFile(customStorePath);
    const storageService = new FileStorageService(storagePath);
    const cryptoService = new CryptoService();
    this.projectService = new ProjectService(cryptoService, storageService);
    const envContent = await fs.readFile(envFile, 'utf8');
    const secrets = parseEnv(envContent);
    await this.projectService.addSecrets(projectName, secrets, password);
  }
} 