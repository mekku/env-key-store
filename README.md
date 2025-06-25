# Store - Encrypted Project Secrets Manager

A CLI tool for managing encrypted project secrets and environment variables.

## Features

- 🔐 Encrypted storage of project secrets
- 🗂️ Project-based organization
- 🔑 Password-protected access (stored securely)
- 📁 Configurable storage location
- 🚀 Easy CLI interface
- 🔄 Multiple store files support
- 🔐 Custom password per operation

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd store-encrypter

# Install dependencies
yarn install

# Build the project
yarn build

# Link globally (optional)
yarn link
```

## Usage

### Initial Setup

1. Initialize with a master password:
```bash
env-key-store init
```

2. Configure storage location (optional):
```bash
env-key-store use '/path/to/your/storage/file'
```

### Managing Secrets

#### Set secrets for a project:
```bash
env-key-store set <project-name> KEY=value
env-key-store set <project-name> KEY1=value1 KEY2=value2
```

Examples:
```bash
env-key-store set projecta API_KEY=abc123
env-key-store set projecta ENDPOINT=https://api.example.com DATABASE_URL=postgres://...
```

#### Pull secrets to .env file:
```bash
env-key-store pull <project-name> [output-file]
```

Examples:
```bash
env-key-store pull projecta .env
env-key-store pull projecta .env.local
```

#### Push secrets from a .env file:
```bash
env-key-store push <project-name> <envfile>
```

Examples:
```bash
env-key-store push projecta .env
```

#### Replace all secrets in a project:
```bash
env-key-store replace <project-name> <envfile>
```

Examples:
```bash
env-key-store replace projecta .env
```

#### Remove specific keys from a project:
```bash
env-key-store unset <project-name> <keys...>
```

Examples:
```bash
env-key-store unset projecta API_KEY DATABASE_URL
```

#### List projects:
```bash
env-key-store list
```

#### Remove a project:
```bash
env-key-store remove <project-name>
```

#### Change master password:
```bash
env-key-store change-password
```

### Advanced Options

All commands support these optional flags:

- `-s, --store <path>` - Use a custom store file path
- `-p, --password <password>` - Use a custom password for this operation

Examples:
```bash
# Use different store file
env-key-store set projecta API_KEY=abc123 -s /path/to/other/store

# Use different password
env-key-store pull projecta .env -p mypassword

# Use both custom store and password
env-key-store list -s ./backup.store -p backup-password

# Change password for specific store
env-key-store change-password -s /path/to/store
```

## Security

- All secrets are encrypted using AES-256-GCM
- Master password is encrypted and stored locally
- Storage file can be placed anywhere (including cloud storage)
- No secrets are ever stored in plain text
- No password prompts required after initial setup
- Support for multiple encrypted stores with different passwords

## Configuration

The tool stores configuration in:
- `~/.env-key-store/config.json` - Configuration and encrypted password
- Custom storage file (configurable via `env-key-store use`)

## Development

```bash
# Run in development mode
yarn dev

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format

# Validate (run tests)
yarn validate
```

## Contributing

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and releases. Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

### Setup Commit Message Template

To help you follow the conventional commits format, you can set up a Git commit message template:

```bash
# Option 1: Use the setup script
yarn setup

# Option 2: Manual setup
git config commit.template .gitmessage
```

This will automatically show the commit message template when you run `git commit` without the `-m` flag.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Examples

```bash
# Feature
git commit -m "feat: add support for custom encryption algorithms"

# Bug fix
git commit -m "fix: resolve issue with password validation"

# Breaking change
git commit -m "feat!: change default encryption method to AES-256-GCM

BREAKING CHANGE: The default encryption method has changed from AES-128 to AES-256-GCM. Existing encrypted files will need to be re-encrypted."

# Documentation
git commit -m "docs: update README with new usage examples"
```

### Release Process

When you push to the `main` branch, semantic-release will:

1. Analyze your commit messages
2. Determine the next version number
3. Generate release notes
4. Update the CHANGELOG.md
5. Create a Git tag
6. Publish to npm
7. Create a GitHub release

## Architecture

The project follows Domain-Driven Design (DDD) principles:

- **Domain Layer**: Core business logic for encryption/decryption
- **Application Layer**: CLI commands and orchestration
- **Infrastructure Layer**: File system operations and crypto utilities

## License

MIT 