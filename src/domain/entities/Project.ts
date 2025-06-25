export interface Project {
  name: string;
  secrets: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStore {
  projects: Record<string, Project>;
  version: string;
} 