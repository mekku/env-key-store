import { Project, ProjectStore } from '../entities/Project';
import { ICryptoService } from '../interfaces/ICryptoService';
import { IStorageService } from '../interfaces/IStorageService';

export class ProjectService {
  constructor(
    private cryptoService: ICryptoService,
    private storageService: IStorageService
  ) {}

  async setSecrets(projectName: string, secrets: Record<string, string>, password: string): Promise<void> {
    const store = await this.loadStore(password);
    
    const now = new Date();
    const project: Project = {
      name: projectName,
      secrets: { ...secrets },
      createdAt: store.projects[projectName]?.createdAt || now,
      updatedAt: now
    };

    store.projects[projectName] = project;
    await this.saveStore(store, password);
  }

  async addSecrets(projectName: string, secrets: Record<string, string>, password: string): Promise<void> {
    const store = await this.loadStore(password);
    
    const now = new Date();
    const existingProject = store.projects[projectName];
    const existingSecrets = existingProject?.secrets || {};
    
    const project: Project = {
      name: projectName,
      secrets: { ...existingSecrets, ...secrets }, // Merge: new secrets override existing ones
      createdAt: existingProject?.createdAt || now,
      updatedAt: now
    };

    store.projects[projectName] = project;
    await this.saveStore(store, password);
  }

  async removeSecrets(projectName: string, keys: string[], password: string): Promise<void> {
    const store = await this.loadStore(password);
    
    if (!store.projects[projectName]) {
      throw new Error(`Project '${projectName}' not found`);
    }

    const now = new Date();
    const existingSecrets = { ...store.projects[projectName].secrets };
    
    for (const key of keys) {
      delete existingSecrets[key];
    }

    const project: Project = {
      name: projectName,
      secrets: existingSecrets,
      createdAt: store.projects[projectName].createdAt,
      updatedAt: now
    };

    store.projects[projectName] = project;
    await this.saveStore(store, password);
  }

  async getSecrets(projectName: string, password: string): Promise<Record<string, string>> {
    const store = await this.loadStore(password);
    const project = store.projects[projectName];
    
    if (!project) {
      throw new Error(`Project '${projectName}' not found`);
    }

    return project.secrets;
  }

  async listProjects(password: string): Promise<string[]> {
    const store = await this.loadStore(password);
    return Object.keys(store.projects);
  }

  async removeProject(projectName: string, password: string): Promise<void> {
    const store = await this.loadStore(password);
    
    if (!store.projects[projectName]) {
      throw new Error(`Project '${projectName}' not found`);
    }

    delete store.projects[projectName];
    await this.saveStore(store, password);
  }

  async reEncryptStore(oldPassword: string, newPassword: string): Promise<void> {
    const store = await this.loadStore(oldPassword);
    await this.saveStore(store, newPassword);
  }

  private async loadStore(password: string): Promise<ProjectStore> {
    if (!(await this.storageService.exists())) {
      return {
        projects: {},
        version: '1.0.0'
      };
    }

    const encryptedData = await this.storageService.load();
    const decryptedData = await this.cryptoService.decrypt(encryptedData, password);
    return JSON.parse(decryptedData);
  }

  private async saveStore(store: ProjectStore, password: string): Promise<void> {
    const data = JSON.stringify(store, null, 2);
    const encryptedData = await this.cryptoService.encrypt(data, password);
    await this.storageService.save(encryptedData);
  }
} 