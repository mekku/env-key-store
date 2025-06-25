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
env-store init
```

2. Configure storage location (optional):
```bash
env-store use '/path/to/your/storage/file'
```

### Managing Secrets

#### Set secrets for a project:
```bash
env-store set <project-name> KEY=value
env-store set <project-name> KEY1=value1 KEY2=value2
```

Examples:
```bash
env-store set projecta API_KEY=abc123
env-store set projecta ENDPOINT=https://api.example.com DATABASE_URL=postgres://...
```

#### Pull secrets to .env file:
```bash
env-store pull <project-name> [output-file]
```

Examples:
```bash
env-store pull projecta .env
env-store pull projecta .env.local
```

#### Push secrets from a .env file:
```bash
env-store push <project-name> <envfile>
```

Examples:
```bash
env-store push projecta .env
```

#### Replace all secrets in a project:
```bash
env-store replace <project-name> <envfile>
```

Examples:
```bash
env-store replace projecta .env
```

#### Remove specific keys from a project:
```bash
env-store unset <project-name> <keys...>
```

Examples:
```bash
env-store unset projecta API_KEY DATABASE_URL
```

#### List projects:
```bash
env-store list
```

#### Remove a project:
```bash
env-store remove <project-name>
```

#### Change master password:
```bash
env-store change-password
```

### Advanced Options

All commands support these optional flags:

- `-s, --store <path>` - Use a custom store file path
- `-p, --password <password>` - Use a custom password for this operation

Examples:
```bash
# Use different store file
env-store set projecta API_KEY=abc123 -s /path/to/other/store

# Use different password
env-store pull projecta .env -p mypassword

# Use both custom store and password
env-store list -s ./backup.store -p backup-password

# Change password for specific store
env-store change-password -s /path/to/store
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
- `~/.env-store/config.json` - Configuration and encrypted password
- Custom storage file (configurable via `env-store use`)

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
```

## Architecture

The project follows Domain-Driven Design (DDD) principles:

- **Domain Layer**: Core business logic for encryption/decryption
- **Application Layer**: CLI commands and orchestration
- **Infrastructure Layer**: File system operations and crypto utilities

## License

MIT 