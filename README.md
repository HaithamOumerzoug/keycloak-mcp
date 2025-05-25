# Keycloak MCP

[![smithery badge](https://smithery.ai/badge/@HaithamOumerzoug/keycloak-mcp)](https://smithery.ai/server/@HaithamOumerzoug/keycloak-mcp)

A Model Context Protocol (MCP) server implementation for Keycloak, providing a standardized interface for managing Keycloak users and realms.

## Description

This project implements an MCP server that integrates with Keycloak, allowing you to manage Keycloak users and realms through a standardized protocol. It uses the official Keycloak Admin Client to interact with Keycloak's API.

## Available Tools

### create-user
Creates a new user in a specified realm.

**Inputs**:
- `realm`: The realm name
- `username`: Username for the new user
- `email`: Email address for the user
- `firstName`: User's first name
- `lastName`: User's last name

### delete-user
Deletes a user from a specified realm.

**Inputs**:
- `realm`: The realm name
- `userId`: The ID of the user to delete

### list-realms
Lists all available realms.

### list-users
Lists all users in a specified realm.

**Inputs**:
- `realm`: The realm name

### assign-client-role-to-user
Assigns a client role to a specific user.

**Inputs**:
- `realm`: The realm name
- `userId`: The ID of the user
- `clientId`: The ID of the client
- `roleName`: The name of the role to assign

### add-user-to-group
Adds a user to a specific group.

**Inputs**:
- `realm`: The realm name
- `userId`: The ID of the user
- `groupId`: The ID of the group

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm
- A running Keycloak instance

## Installation

### Installing via Smithery

To install keycloak-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@HaithamOumerzoug/keycloak-mcp):

```bash
npx -y @smithery/cli install @HaithamOumerzoug/keycloak-mcp --client claude
```

The server is available as an NPM package:
```bash
# Direct usage with npx
npx -y keycloak-mcp

# Or global installation
npm install -g keycloak-mcp
```

## Configuration

### Using NPM Package (Recommended)
Configure the server in your Cursor IDE, Cline or Claude Desktop MCP configuration file:

```json
{
  "mcpServers": {
    "keycloak": {
      "command": "npx",
      "args": ["-y", "keycloak-mcp"],
      "env": {
        "KEYCLOAK_URL": "http://localhost:8080",
        "KEYCLOAK_ADMIN": "admin",
        "KEYCLOAK_ADMIN_PASSWORD": "admin"
      }
    }
  }
}
```

### For Local Development
```json
{
  "mcpServers": {
    "keycloak": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "env": {
        "KEYCLOAK_URL": "http://localhost:8080",
        "KEYCLOAK_ADMIN": "admin",
        "KEYCLOAK_ADMIN_PASSWORD": "admin"
      }
    }
  }
}
```

## Development

To set up the development environment:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the project:
   ```bash
   npm run watch
   ```

### Available Scripts

- `npm run build` - Builds the project and makes the CLI executable
- `npm run prepare` - Runs the build script (used during package installation)
- `npm run watch` - Watches for changes and rebuilds automatically

## Dependencies

### Main Dependencies
- `@keycloak/keycloak-admin-client` - Official Keycloak Admin Client
- `@modelcontextprotocol/sdk` - MCP SDK for standardized protocol implementation
- `zod` - TypeScript-first schema validation

### Dev Dependencies
- `typescript` - For TypeScript support
- `@types/node` - TypeScript definitions for Node.js
- `shx` - Cross-platform shell commands

## License

MIT

## Author

[OUMERZOUG Haitham](https://www.linkedin.com/in/haitham-oumerzoug/)
