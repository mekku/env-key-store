import { ProjectService } from '../../domain/services/ProjectService';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

export class SetCommand {
  private projectService?: ProjectService;
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(projectName: string, secrets: string[], customStorePath?: string, customPassword?: string): Promise<void> {
    await this.configService.initialize();
    
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-store init" first.');
    }

    const password = customPassword || await this.configService.getPassword();
    const storagePath = await this.configService.getStoragePathForFile(customStorePath);
    const storageService = new FileStorageService(storagePath);
    const cryptoService = new CryptoService();
    
    this.projectService = new ProjectService(cryptoService, storageService);

    const secretsMap: Record<string, string> = {};
    
    for (const secret of secrets) {
      const [key, value] = secret.split('=', 2);
      if (!key || !value) {
        throw new Error(`Invalid secret format: ${secret}. Expected format: KEY=value`);
      }
      secretsMap[key] = value;
    }

    await this.projectService.addSecrets(projectName, secretsMap, password);
  }
} 