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

  async execute(password: string): Promise<void> {
    await this.configService.initialize();
    
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-store init" first.');
    }

    if (!(await this.configService.verifyPassword(password))) {
      throw new Error('Invalid password');
    }

    const storagePath = await this.configService.getStoragePath();
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