import inquirer from 'inquirer';
import { ProjectService } from '../../domain/services/ProjectService';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { FileStorageService } from '../../infrastructure/storage/FileStorageService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

export class ChangePasswordCommand {
  private projectService?: ProjectService;
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(customStorePath?: string): Promise<void> {
    await this.configService.initialize();
    
    if (!(await this.configService.isInitialized())) {
      throw new Error('Store is not initialized. Please run "env-key-store init" first.');
    }

    const currentPassword = await this.configService.getPassword();
    const storagePath = await this.configService.getStoragePathForFile(customStorePath);
    const storageService = new FileStorageService(storagePath);
    const cryptoService = new CryptoService();
    
    this.projectService = new ProjectService(cryptoService, storageService);

    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'currentPassword',
        message: 'Enter current password:',
        validate: async (input: string) => {
          if (input !== currentPassword) {
            return 'Current password is incorrect';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'newPassword',
        message: 'Enter new password:',
        validate: (input: string) => {
          if (input.length < 8) {
            return 'Password must be at least 8 characters long';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm new password:',
        validate: (input: string, answers: any) => {
          if (input !== answers.newPassword) {
            return 'Passwords do not match';
          }
          return true;
        }
      }
    ]);

    // Re-encrypt the store with new password
    await this.projectService.reEncryptStore(currentPassword, answers.newPassword);
    
    // Update the stored password
    await this.configService.changePassword(answers.newPassword);
    
    console.log('Password changed successfully and store re-encrypted!');
  }
} 