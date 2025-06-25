import inquirer from 'inquirer';
import { ConfigService } from '../../infrastructure/config/ConfigService';
import { CryptoService } from '../../infrastructure/crypto/CryptoService';

export class InitCommand {
  private configService: ConfigService;

  constructor() {
    const cryptoService = new CryptoService();
    this.configService = new ConfigService(cryptoService);
  }

  async execute(): Promise<void> {
    await this.configService.initialize();

    if (await this.configService.isInitialized()) {
      console.log('Store is already initialized.');
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: 'Enter your master password:',
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
        message: 'Confirm your master password:',
        validate: (input: string, answers: any) => {
          if (input !== answers.password) {
            return 'Passwords do not match';
          }
          return true;
        }
      }
    ]);

    await this.configService.setPassword(answers.password);
    console.log('Store initialized successfully!');
  }
} 