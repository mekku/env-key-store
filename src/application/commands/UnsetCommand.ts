import { ProjectService } from '../../domain/services/ProjectService';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

export class UnsetCommand {
  private projectService?: ProjectService;
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(projectName: string, keys: string[], customStorePath?: string, customPassword?: string): Promise<void> {
    await this.configService.initialize();
    
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-key-store init" first.');
    }

    const password = customPassword || await this.configService.getPassword();
    const storagePath = await this.configService.getStoragePathForFile(customStorePath);
    const storageService = new FileStorageService(storagePath);
    const cryptoService = new CryptoService();
    
    this.projectService = new ProjectService(cryptoService, storageService);

    await this.projectService.removeSecrets(projectName, keys, password);
  }
} 