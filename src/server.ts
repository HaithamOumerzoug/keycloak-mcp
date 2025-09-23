import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import KeycloakConfig from "./config/keycloak.ts";
import { InputSchema } from "./schemas/index.ts";
import KeycloakService from "./services/keycloak.ts";

// Initialize Keycloak configuration and service using dependency injection
const keycloakConfig = KeycloakConfig.getInstance();
const keycloakService = new KeycloakService(keycloakConfig);
// Create server instance
const server = new Server(
  {
    name: "keycloak-admin",
    version: "1.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// input schema for the tools

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
    await server.connect(transport);
    console.log(`Keycloak MCP Server running`);
  } catch (error) {
    console.error("Failed to connect server:", error);
  }
}

startServer();
