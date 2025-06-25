export interface IStorageService {
  save(data: string): Promise<void>;
  load(): Promise<string>;
  exists(): Promise<boolean>;
  delete(): Promise<void>;
} 