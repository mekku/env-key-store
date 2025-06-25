import { promises as fs } from 'fs';
import { ProjectService } from '../../domain/services/ProjectService';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

export class PullCommand {
  private projectService?: ProjectService;
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(projectName: string, outputFile: string, customStorePath?: string, customPassword?: string): Promise<void> {
    await this.configService.initialize();
    
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-key-store init" first.');
    }

    const password = customPassword || await this.configService.getPassword();
    const storagePath = await this.configService.getStoragePathForFile(customStorePath);
    const storageService = new FileStorageService(storagePath);
    const cryptoService = new CryptoService();
    
    this.projectService = new ProjectService(cryptoService, storageService);

    const secrets = await this.projectService.getSecrets(projectName, password);
    
    // Convert secrets to .env format with env-key-store markers
    const now = new Date().toISOString();
    const envContent = `# Store secrets for project: ${projectName}
# Generated at: ${now}
# ==========================================
${Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}
# ==========================================
# End of Store secrets
`;

    // Check if file exists and read existing content
    let existingContent = '';
    try {
      existingContent = await fs.readFile(outputFile, 'utf8');
    } catch (error) {
      // File doesn't exist, that's fine
    }

    // Append the new content to existing file
    const finalContent = existingContent + (existingContent ? '\n' : '') + envContent;
    await fs.writeFile(outputFile, finalContent, 'utf8');
  }
} 