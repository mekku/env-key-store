import { ProjectService } from '../../domain/services/ProjectService';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

export class ListCommand {
  private projectService?: ProjectService;
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(customStorePath?: string, customPassword?: string): Promise<void> {
    await this.configService.initialize();
    
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-key-store init" first.');
    }

    const password = customPassword || await this.configService.getPassword();
    const storagePath = await this.configService.getStoragePathForFile(customStorePath);
    const storageService = new FileStorageService(storagePath);
    const cryptoService = new CryptoService();
    
    this.projectService = new ProjectService(cryptoService, storageService);

    const projects = await this.projectService.listProjects(password);
    
    if (projects.length === 0) {
      console.log('No projects found.');
      return;
    }

    console.log('Available projects:');
    projects.forEach(project => {
      console.log(`  - ${project}`);
    });
  }
} 