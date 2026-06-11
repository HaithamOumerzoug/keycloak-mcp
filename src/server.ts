#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import pkg from '../package.json' with { type: 'json' };
import KeycloakConfig from "./config/keycloak.ts";
import { InputSchema } from "./schemas/index.ts";
import KeycloakService from "./services/keycloak.ts";
import { Logger } from "./utils/logger.ts";

// Initialize Keycloak configuration and service using dependency injection
const keycloakConfig = await KeycloakConfig.getInstance();
const keycloakService = new KeycloakService(keycloakConfig);
const logger = new Logger("Server");
// Create server instance
const server = new Server(
  {
    name: "keycloak-admin",
    version: pkg.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create-user",
        description: "Create a new user in a specific realm",
        inputSchema: InputSchema["create-user"],
      },
      {
        name: "delete-user",
        description: "Delete a user from a specific realm",
        inputSchema: InputSchema["delete-user"],
      },
      {
        name: "list-realms",
        description: "List all available realms",
        inputSchema: InputSchema["list-realms"],
      },
      {
        name: "list-users",
        description: "List users in a specific realm",
        inputSchema: InputSchema["list-users"],
      },
      {
        name: "assign-client-role-to-user",
        description: "Assign a client role to a user",
        inputSchema: InputSchema["assign-client-role-to-user"],
      },
      {
        name: "add-user-to-group",
        description: "Add a user to a group",
        inputSchema: InputSchema["add-user-to-group"],
      },
      {
        name: "list-clients",
        description: "List clients in a specific realm",
        inputSchema: InputSchema["list-clients"],
      },
      {
        name: "list-groups",
        description: "List groups in a specific realm",
        inputSchema: InputSchema["list-groups"],
      },
      {
        name: "list-client-roles",
        description: "List roles in a specific client",
        inputSchema: InputSchema["list-client-roles"],
      },
      {
        name: "create-client-role",
        description: "Create a role in a specific client",
        inputSchema: InputSchema["create-client-role"],
      },
      {
        name: "list-protocol-mappers",
        description:
          "List protocol mappers of a client (dedicated scope), including their config",
        inputSchema: InputSchema["list-protocol-mappers"],
      },
      {
        name: "create-protocol-mapper",
        description:
          "Create a protocol mapper on a client (e.g. group membership or client role claim mappers)",
        inputSchema: InputSchema["create-protocol-mapper"],
      },
      {
        name: "list-user-role-mappings",
        description:
          "List all realm and client role mappings assigned to a user",
        inputSchema: InputSchema["list-user-role-mappings"],
      },
    ],
  };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: z.infer<typeof CallToolRequestSchema>) => {
    // Authenticate before handling the request
    await keycloakConfig.authenticate();
    const name: string = request.params.name;
    const args: unknown = request.params.arguments ?? {};

    try {
      switch (name) {
        case "create-user":
          return {
            content: [
              { type: "text", text: await keycloakService.createUser(args) },
            ],
          };
        case "delete-user":
          return {
            content: [
              { type: "text", text: await keycloakService.deleteUser(args) },
            ],
          };
        case "list-realms":
          return {
            content: [
              { type: "text", text: await keycloakService.listRealms() },
            ],
          };
        case "list-users":
          return {
            content: [
              { type: "text", text: await keycloakService.listUsers(args) },
            ],
          };
        case "assign-client-role-to-user":
          return {
            content: [
              {
                type: "text",
                text: await keycloakService.assignClientRoleToUser(args),
              },
            ],
          };
        case "add-user-to-group":
          return {
            content: [
              {
                type: "text",
                text: await keycloakService.addUserToGroup(args),
              },
            ],
          };
        case "list-clients":
          return {
            content: [
              { type: "text", text: await keycloakService.listClients(args) },
            ],
          };
        case "list-groups":
          return {
            content: [
              { type: "text", text: await keycloakService.listGroups(args) },
            ],
          };
        case "list-client-roles":
          return {
            content: [
              {
                type: "text",
                text: await keycloakService.listClientRoles(args),
              },
            ],
          };
        case "create-client-role":
          return {
            content: [
              {
                type: "text",
                text: await keycloakService.createClientRole(args),
              },
            ],
          };
        case "list-protocol-mappers":
          return {
            content: [
              {
                type: "text",
                text: await keycloakService.listProtocolMappers(args),
              },
            ],
          };
        case "create-protocol-mapper":
          return {
            content: [
              {
                type: "text",
                text: await keycloakService.createProtocolMapper(args),
              },
            ],
          };
        case "list-user-role-mappings":
          return {
            content: [
              {
                type: "text",
                text: await keycloakService.listUserRoleMappings(args),
              },
            ],
          };
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Invalid arguments: ${error.errors
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ")}`,
            },
          ],
        };
      }
      throw error;
    }
  }
);

const transport = new StdioServerTransport();

async function startServer() {
  try {
    logger.info(`Starting Keycloak MCP Server...`);
    await server.connect(transport);
    logger.info(`Keycloak Server successfully started`);
  } catch (error) {
    logger.error(`Failed to connect server: , ${error}`);
  }
}

startServer();
