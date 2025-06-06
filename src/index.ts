import KcAdminClient from "@keycloak/keycloak-admin-client";
import ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation.js";
import GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation.js";
import RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation.js";
import RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation.js";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server(
  {
    name: "keycloak-admin",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const kcAdminClient = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_URL || "http://localhost:8080",
  realmName: "master",
});

const CreateUserSchema = z.object({
  realm: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

const DeleteUserSchema = z.object({
  realm: z.string(),
  userId: z.string(),
});

const ListUsersSchema = z.object({
  realm: z.string(),
});

const AssignClientRoleSchema = z.object({
  realm: z.string(),
  userId: z.string(),
  clientUniqueId: z.string(),
  roleName: z.string(),
});

const AddUserToGroupSchema = z.object({
  realm: z.string(),
  userId: z.string(),
  groupId: z.string(),
});

const ListClientsSchema = z.object({
  realm: z.string(),
});

const ListGroupsSchema = z.object({
  realm: z.string(),
});

const ListClientRolesSchema = z.object({
  realm: z.string(),
  clientUniqueId: z.string(),
});

async function authenticate() {
  await kcAdminClient.auth({
    username: process.env.KEYCLOAK_ADMIN || "admin",
    password: process.env.KEYCLOAK_ADMIN_PASSWORD || "admin",
    grantType: "password",
    clientId: "admin-cli",
  });
}

// input schema for the tools
const inputSchema = {
  "create-user": {
    type: "object",
    properties: {
      realm: { type: "string" },
      username: { type: "string" },
      email: { type: "string", format: "email" },
      firstName: { type: "string" },
      lastName: { type: "string" },
    },
    required: ["realm", "username", "email", "firstName", "lastName"],
  },
  "delete-user": {
    type: "object",
    properties: {
      realm: { type: "string" },
      userId: { type: "string" },
    },
    required: ["realm", "userId"],
  },
  "list-realms": {
    type: "object",
    properties: {},
    required: [],
  },
  "list-users": {
    type: "object",
    properties: {
      realm: { type: "string" },
    },
    required: ["realm"],
  },
  "assign-client-role-to-user": {
    type: "object",
    properties: {
      realm: { type: "string" },
      userId: { type: "string" },
      clientUniqueId: { type: "string" },
      roleName: { type: "string" },
    },
    required: ["realm", "userId", "clientUniqueId", "roleName"],
  },
  "add-user-to-group": {
    type: "object",
    properties: {
      realm: { type: "string" },
      userId: { type: "string" },
      groupId: { type: "string" },
    },
    required: ["realm", "userId", "groupId"],
  },
  "list-clients": {
    type: "object",
    properties: {
      realm: { type: "string" },
    },
    required: ["realm"],
  },
  "list-groups": {
    type: "object",
    properties: {
      realm: { type: "string" },
    },
    required: ["realm"],
  },
  "list-client-roles": {
    type: "object",
    properties: {
      realm: z.string(),
      clientUniqueId: z.string(),
    },
    required: ["realm", "clientUniqueId"],
  },
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create-user",
        description: "Create a new user in a specific realm",
        inputSchema: inputSchema["create-user"],
      },
      {
        name: "delete-user",
        description: "Delete a user from a specific realm",
        inputSchema: inputSchema["delete-user"],
      },
      {
        name: "list-realms",
        description: "List all available realms",
        inputSchema: inputSchema["list-realms"],
      },
      {
        name: "list-users",
        description: "List users in a specific realm",
        inputSchema: inputSchema["list-users"],
      },
      {
        name: "assign-client-role-to-user",
        description: "Assign a client role to a user",
        inputSchema: inputSchema["assign-client-role-to-user"],
      },
      {
        name: "add-user-to-group",
        description: "Add a user to a group",
        inputSchema: inputSchema["add-user-to-group"],
      },
      {
        name: "list-clients",
        description: "List clients in a specific realm",
        inputSchema: inputSchema["list-clients"],
      },
      {
        name: "list-groups",
        description: "List groups in a specific realm",
        inputSchema: inputSchema["list-groups"],
      },
      {
        name: "list-client-roles",
        description: "List roles in a specific client",
        inputSchema: inputSchema["list-client-roles"],
      },
    ],
  };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request: z.infer<typeof CallToolRequestSchema>) => {
    await authenticate();

    const name: string = request.params.name;
    const args: unknown = request.params.arguments ?? {};

    try {
      switch (name) {
        case "create-user": {
          const { realm, username, email, firstName, lastName } =
            CreateUserSchema.parse(args);

          const user: UserRepresentation = await kcAdminClient.users.create({
            realm,
            username,
            email,
            firstName,
            lastName,
            enabled: true,
          });

          return {
            content: [
              {
                type: "text",
                text: `User created successfully. User ID: ${user.id}`,
              },
            ],
          };
        }

        case "delete-user": {
          const { realm, userId } = DeleteUserSchema.parse(args);

          await kcAdminClient.users.del({ id: userId, realm });

          return {
            content: [
              {
                type: "text",
                text: `User ${userId} deleted successfully from realm ${realm}`,
              },
            ],
          };
        }

        case "list-realms": {
          const realms: RealmRepresentation[] =
            await kcAdminClient.realms.find();
          return {
            content: [
              {
                type: "text",
                text: `Available realms:\n${realms
                  .map((r) => `- ${r.realm} (${r.id})`)
                  .join("\n")}`,
              },
            ],
          };
        }

        case "list-users": {
          const { realm } = ListUsersSchema.parse(args);

          const users: UserRepresentation[] = await kcAdminClient.users.find({
            realm,
          });
          return {
            content: [
              {
                type: "text",
                text: `Users in realm ${realm}:\n${users
                  .map((u) => `- ${u.username} (${u.id})`)
                  .join("\n")}`,
              },
            ],
          };
        }

        case "assign-client-role-to-user": {
          const { realm, userId, clientUniqueId, roleName } =
            AssignClientRoleSchema.parse(args);

          const roles: RoleRepresentation[] =
            await kcAdminClient.clients.listRoles({
              id: clientUniqueId,
              realm,
            });
          const role: RoleRepresentation | undefined = roles.find(
            (r) => r.name === roleName
          );

          if (!role || !role.id || !role.name) {
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `Role '${roleName}' not found or has no ID.`,
                },
              ],
            };
          }

          await kcAdminClient.users.addClientRoleMappings({
            realm,
            id: userId,
            clientUniqueId,
            roles: [
              {
                id: role.id as string, // safely asserted since we check below
                name: role.name,
              },
            ],
          });

          return {
            content: [
              {
                type: "text",
                text: `Assigned role '${roleName}' to user ${userId} in client ${clientUniqueId}`,
              },
            ],
          };
        }

        case "add-user-to-group": {
          const { realm, userId, groupId } = AddUserToGroupSchema.parse(args);

          await kcAdminClient.users.addToGroup({
            realm,
            id: userId,
            groupId,
          });

          return {
            content: [
              {
                type: "text",
                text: `User ${userId} added to group ${groupId} in realm ${realm}`,
              },
            ],
          };
        }

        case "list-clients": {
          const { realm } = ListClientsSchema.parse(args);

          const clients: ClientRepresentation[] =
            await kcAdminClient.clients.find({ realm });
          return {
            content: [
              {
                type: "text",
                text: `Clients in realm ${realm}:\n${clients
                  .map((c) => `- ${c.clientId} (${c.id})`)
                  .join("\n")}`,
              },
            ],
          };
        }

        case "list-groups": {
          const { realm } = ListGroupsSchema.parse(args);

          const groups: GroupRepresentation[] = await kcAdminClient.groups.find(
            { realm }
          );
          return {
            content: [
              {
                type: "text",
                text: `Groups in realm ${realm}:\n${groups
                  .map((g) => `- ${g.name} (${g.id})`)
                  .join("\n")}`,
              },
            ],
          };
        }

        case "list-client-roles": {
          const { realm, clientUniqueId } = ListClientRolesSchema.parse(args);

          const roles: RoleRepresentation[] =
            await kcAdminClient.clients.listRoles({
              id: clientUniqueId,
              realm,
            });
          return {
            content: [
              {
                type: "text",
                text: `Roles in client ${clientUniqueId} in realm ${realm}:\n${roles
                  .map((r) => `- ${r.name}`)
                  .join("\n")}`,
              },
            ],
          };
        }

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
try {
  await server.connect(transport);
  console.log(`Keycloak MCP Server running`);
} catch (error) {
  console.error("Failed to connect server:", error);
}
