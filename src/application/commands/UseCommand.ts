import { ConfigService } from '../../infrastructure/config/ConfigService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

export class UseCommand {
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(storagePath: string): Promise<void> {
    await this.configService.initialize();
    
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-store init" first.');
    }

    await this.configService.setStoragePath(storagePath);
    console.log(`Storage path set to: ${storagePath}`);
  }
} 