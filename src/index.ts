#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { InitCommand } from './application/commands/InitCommand';
import { SetCommand } from './application/commands/SetCommand';
import { PullCommand } from './application/commands/PullCommand';
import { ListCommand } from './application/commands/ListCommand';
import { UseCommand } from './application/commands/UseCommand';
import { PushCommand } from './application/commands/PushCommand';
import { UnsetCommand } from './application/commands/UnsetCommand';
import { ReplaceCommand } from './application/commands/ReplaceCommand';

const program = new Command();

program
  .name('env-store')
  .description('A CLI tool for managing encrypted project secrets')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize Store with a master password')
  .action(async () => {
    try {
      const initCommand = new InitCommand();
      await initCommand.execute();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Set command
program
  .command('set')
  .description('Set secrets for a project')
  .argument('<project>', 'Project name')
  .argument('<secrets...>', 'Secrets in KEY=value format')
  .action(async (project: string, secrets: string[]) => {
    try {
      const setCommand = new SetCommand();
      await setCommand.execute(project, secrets);
      console.log(chalk.green(`✓ Secrets set for project '${project}'`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Pull command
program
  .command('pull')
  .description('Pull secrets to .env file')
  .argument('<project>', 'Project name')
  .argument('[output]', 'Output file (default: .env)', '.env')
  .action(async (project: string, output: string) => {
    try {
      const pullCommand = new PullCommand();
      await pullCommand.execute(project, output);
      console.log(chalk.green(`✓ Secrets pulled to '${output}'`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all projects')
  .action(async () => {
    try {
      const listCommand = new ListCommand();
      await listCommand.execute();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Use command
program
  .command('use')
  .description('Set storage file path')
  .argument('<path>', 'Storage file path')
  .action(async (path: string) => {
    try {
      const useCommand = new UseCommand();
      await useCommand.execute(path);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Push command
program
  .command('push')
  .description('Push all keys from a .env file to a project (adds to existing keys)')
  .argument('<project>', 'Project name')
  .argument('<envfile>', '.env file to import')
  .action(async (project: string, envfile: string) => {
    try {
      const pushCommand = new PushCommand();
      await pushCommand.execute(project, envfile);
      console.log(chalk.green(`✓ Secrets from '${envfile}' added to project '${project}'`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Unset command
program
  .command('unset')
  .description('Remove specific keys from a project')
  .argument('<project>', 'Project name')
  .argument('<keys...>', 'Keys to remove')
  .action(async (project: string, keys: string[]) => {
    try {
      const unsetCommand = new UnsetCommand();
      await unsetCommand.execute(project, keys);
      console.log(chalk.green(`✓ Keys removed from project '${project}': ${keys.join(', ')}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Replace command
program
  .command('replace')
  .description('Replace all keys in a project with keys from a .env file')
  .argument('<project>', 'Project name')
  .argument('<envfile>', '.env file to import')
  .action(async (project: string, envfile: string) => {
    try {
      const replaceCommand = new ReplaceCommand();
      await replaceCommand.execute(project, envfile);
      console.log(chalk.green(`✓ All secrets in project '${project}' replaced with keys from '${envfile}'`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(); 