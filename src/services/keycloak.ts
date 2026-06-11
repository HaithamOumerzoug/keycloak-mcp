import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation.js";
import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation.js";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation.js";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation.js";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation.js";
import KeycloakConfig from "../config/keycloak.ts";
import {
  AddUserToGroupSchema,
  AssignClientRoleSchema,
  CreateClientRoleSchema,
  CreateProtocolMapperSchema,
  CreateUserSchema,
  DeleteUserSchema,
  ListClientRolesSchema,
  ListClientsSchema,
  ListGroupsSchema,
  ListProtocolMappersSchema,
  ListUserRoleMappingsSchema,
  ListUsersSchema,
} from "../schemas/index.ts";

class KeycloakService {
  private keycloakConfig: KeycloakConfig;
  private kcAdminClient: KeycloakAdminClient;

  constructor(keycloakConfig: KeycloakConfig) {
    this.keycloakConfig = keycloakConfig;
    this.kcAdminClient = this.keycloakConfig.getAdminClient();
  }

  public async createUser(args: unknown): Promise<string> {
    const { realm, username, email, firstName, lastName } =
      CreateUserSchema.parse(args);
    const user: UserRepresentation = await this.kcAdminClient.users.create({
      realm,
      username,
      email,
      firstName,
      lastName,
      enabled: true,
    });
    return `User created successfully. User ID: ${user.id}`;
  }

  public async deleteUser(args: unknown): Promise<string> {
    const { realm, userId } = DeleteUserSchema.parse(args);
    await this.kcAdminClient.users.del({ id: userId, realm });
    return `User ${userId} deleted successfully from realm ${realm}`;
  }

  public async listRealms(): Promise<string> {
    const realms: RealmRepresentation[] =
      await this.kcAdminClient.realms.find();
    return `Available realms:\n${realms
      .map((r) => `- ${r.realm} (${r.id})`)
      .join("\n")}`;
  }

  public async listUsers(args: unknown): Promise<string> {
    const { realm } = ListUsersSchema.parse(args);
    const users: UserRepresentation[] = await this.kcAdminClient.users.find({
      realm,
    });
    return `Users in realm ${realm}:\n${users
      .map((u) => `- ${u.username} (${u.id})`)
      .join("\n")}`;
  }

  public async assignClientRoleToUser(args: unknown): Promise<string> {
    const { realm, userId, clientUniqueId, roleName } =
      AssignClientRoleSchema.parse(args);
    const roles: RoleRepresentation[] =
      await this.kcAdminClient.clients.listRoles({
        id: clientUniqueId,
        realm,
      });
    const role: RoleRepresentation | undefined = roles.find(
      (r) => r.name === roleName
    );
    if (!role || !role.id || !role.name) {
      throw new Error(`Role '${roleName}' not found or has no ID.`);
    }
    await this.kcAdminClient.users.addClientRoleMappings({
      realm,
      id: userId,
      clientUniqueId,
      roles: [{ id: role.id, name: role.name }],
    });
    return `Assigned role '${roleName}' to user ${userId} in client ${clientUniqueId}`;
  }

  public async addUserToGroup(args: unknown): Promise<string> {
    const { realm, userId, groupId } = AddUserToGroupSchema.parse(args);
    await this.kcAdminClient.users.addToGroup({
      realm,
      id: userId,
      groupId,
    });
    return `User ${userId} added to group ${groupId} in realm ${realm}`;
  }

  public async listClients(args: unknown): Promise<string> {
    const { realm } = ListClientsSchema.parse(args);
    const clients: ClientRepresentation[] =
      await this.kcAdminClient.clients.find({ realm });
    return `Clients in realm ${realm}:\n${clients
      .map((c) => `- ${c.clientId} (${c.id})`)
      .join("\n")}`;
  }

  public async listGroups(args: unknown): Promise<string> {
    const { realm } = ListGroupsSchema.parse(args);
    const groups: GroupRepresentation[] = await this.kcAdminClient.groups.find({
      realm,
    });
    return `Groups in realm ${realm}:\n${groups
      .map((g) => `- ${g.name} (${g.id})`)
      .join("\n")}`;
  }

  public async listClientRoles(args: unknown): Promise<string> {
    const { realm, clientUniqueId } = ListClientRolesSchema.parse(args);
    const roles: RoleRepresentation[] =
      await this.kcAdminClient.clients.listRoles({
        id: clientUniqueId,
        realm,
      });
    return `Roles in client ${clientUniqueId} in realm ${realm}:\n${roles
      .map((r) => `- ${r.name}`)
      .join("\n")}`;
  }

  public async createClientRole(args: unknown): Promise<string> {
    const { realm, clientUniqueId, roleName, description } =
      CreateClientRoleSchema.parse(args);
    await this.kcAdminClient.clients.createRole({
      id: clientUniqueId,
      realm,
      name: roleName,
      description,
    });
    return `Role '${roleName}' created in client ${clientUniqueId} in realm ${realm}`;
  }

  public async listProtocolMappers(args: unknown): Promise<string> {
    const { realm, clientUniqueId } = ListProtocolMappersSchema.parse(args);
    const mappers = await this.kcAdminClient.clients.listProtocolMappers({
      id: clientUniqueId,
      realm,
    });
    if (!mappers.length) {
      return `No protocol mappers in client ${clientUniqueId} in realm ${realm}`;
    }
    return `Protocol mappers in client ${clientUniqueId} in realm ${realm}:\n${mappers
      .map(
        (m) =>
          `- ${m.name} [${m.protocolMapper}] config=${JSON.stringify(
            m.config ?? {}
          )}`
      )
      .join("\n")}`;
  }

  public async createProtocolMapper(args: unknown): Promise<string> {
    const { realm, clientUniqueId, name, protocolMapper, protocol, config } =
      CreateProtocolMapperSchema.parse(args);
    await this.kcAdminClient.clients.addProtocolMapper(
      { id: clientUniqueId, realm },
      { name, protocol, protocolMapper, config }
    );
    return `Protocol mapper '${name}' [${protocolMapper}] created in client ${clientUniqueId} in realm ${realm}`;
  }

  public async listUserRoleMappings(args: unknown): Promise<string> {
    const { realm, userId } = ListUserRoleMappingsSchema.parse(args);
    const mappings = await this.kcAdminClient.users.listRoleMappings({
      id: userId,
      realm,
    });
    const realmRoles = (mappings.realmMappings ?? [])
      .map((r) => `- [realm] ${r.name}`)
      .join("\n");
    const clientRoles = Object.entries(mappings.clientMappings ?? {})
      .flatMap(([client, m]: [string, any]) =>
        (m.mappings ?? []).map((r: any) => `- [client:${client}] ${r.name}`)
      )
      .join("\n");
    const all = [realmRoles, clientRoles].filter(Boolean).join("\n");
    return all
      ? `Role mappings for user ${userId} in realm ${realm}:\n${all}`
      : `User ${userId} has no role mappings in realm ${realm}`;
  }
}

export default KeycloakService;
