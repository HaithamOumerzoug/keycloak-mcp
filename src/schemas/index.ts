import { z } from "zod";

export const CreateUserSchema = z.object({
  realm: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

export const DeleteUserSchema = z.object({
  realm: z.string(),
  userId: z.string(),
});

export const ListUsersSchema = z.object({
  realm: z.string(),
});

export const AssignClientRoleSchema = z.object({
  realm: z.string(),
  userId: z.string(),
  clientUniqueId: z.string(),
  roleName: z.string(),
});

export const AddUserToGroupSchema = z.object({
  realm: z.string(),
  userId: z.string(),
  groupId: z.string(),
});

export const ListClientsSchema = z.object({
  realm: z.string(),
});

export const ListGroupsSchema = z.object({
  realm: z.string(),
});

export const ListClientRolesSchema = z.object({
  realm: z.string(),
  clientUniqueId: z.string(),
});

export const CreateClientRoleSchema = z.object({
  realm: z.string(),
  clientUniqueId: z.string(),
  roleName: z.string(),
  description: z.string().optional(),
});

export const ListProtocolMappersSchema = z.object({
  realm: z.string(),
  clientUniqueId: z.string(),
});

export const CreateProtocolMapperSchema = z.object({
  realm: z.string(),
  clientUniqueId: z.string(),
  name: z.string(),
  protocolMapper: z.string(),
  protocol: z.string().default("openid-connect"),
  config: z.record(z.string()).default({}),
});

export const ListUserRoleMappingsSchema = z.object({
  realm: z.string(),
  userId: z.string(),
});

export const InputSchema = {
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
      realm: { type: "string" },
      clientUniqueId: { type: "string" },
    },
    required: ["realm", "clientUniqueId"],
  },
  "create-client-role": {
    type: "object",
    properties: {
      realm: { type: "string" },
      clientUniqueId: { type: "string" },
      roleName: { type: "string" },
      description: { type: "string" },
    },
    required: ["realm", "clientUniqueId", "roleName"],
  },
  "list-protocol-mappers": {
    type: "object",
    properties: {
      realm: { type: "string" },
      clientUniqueId: { type: "string" },
    },
    required: ["realm", "clientUniqueId"],
  },
  "create-protocol-mapper": {
    type: "object",
    properties: {
      realm: { type: "string" },
      clientUniqueId: { type: "string" },
      name: { type: "string" },
      protocolMapper: {
        type: "string",
        description:
          "Mapper type id, e.g. oidc-usermodel-client-role-mapper or oidc-group-membership-mapper",
      },
      protocol: { type: "string", default: "openid-connect" },
      config: {
        type: "object",
        additionalProperties: { type: "string" },
        description:
          'Mapper config, e.g. {"claim.name": "groups", "id.token.claim": "true", "full.path": "false"}',
      },
    },
    required: ["realm", "clientUniqueId", "name", "protocolMapper"],
  },
  "list-user-role-mappings": {
    type: "object",
    properties: {
      realm: { type: "string" },
      userId: { type: "string" },
    },
    required: ["realm", "userId"],
  },
};

export const KeycloakAdminCredentialSchema = z.object({
  adminUsername: z
    .string()
    .trim()
    .min(1, "Admin username cannot be empty")
    .describe("Keycloak admin username"),

  adminPassword: z
    .string()
    .trim()
    .min(1, "Admin password cannot be empty")
    .describe("Keycloak admin password"),
  baseUrl: z
    .string()
    .trim()
    .min(1, "Keycloak URL cannot be empty")
    .refine((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return url.startsWith("http://") || url.startsWith("https://");
      }
    }, "Keycloak URL must be a valid URL starting with http:// or https://")
    .transform((url) => url.replace(/\/+$/, ""))
    .describe("Keycloak server URL"),
});
