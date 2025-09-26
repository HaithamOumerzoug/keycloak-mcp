import KcAdminClient from "@keycloak/keycloak-admin-client";
import { ServerError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
import { KeycloakAdminCredentialSchema } from "../schemas/index.ts";

interface KeycloakAdminCredentials {
  adminUsername?: string;
  adminPassword?: string;
  baseUrl?: string;
}

class KeycloakConfig {
  private static instance: KeycloakConfig;
  private kcAdminClient: KcAdminClient;
  private credentials: KeycloakAdminCredentials;

  private constructor(credentials: KeycloakAdminCredentials) {
    this.credentials = KeycloakAdminCredentialSchema.parse(credentials);
    this.kcAdminClient = new KcAdminClient({
      baseUrl: this.credentials.baseUrl,
      realmName: "master",
    });
  }

  public static getInstance(): KeycloakConfig {
    if (!KeycloakConfig.instance) {
      try {
        const adminCredentials: KeycloakAdminCredentials = {
          adminUsername: process.env.KEYCLOAK_ADMIN,
          adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD,
          baseUrl: process.env.KEYCLOAK_URL,
        };
        KeycloakConfig.instance = new KeycloakConfig(
          KeycloakAdminCredentialSchema.parse(adminCredentials)
        );
      } catch (error) {
        throw new ServerError(
          `Invalid configuration: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
    return KeycloakConfig.instance;
  }

  public getAdminClient(): KcAdminClient {
    return this.kcAdminClient;
  }

  public async authenticate() {
    console.log("Authentication");

    await this.kcAdminClient.auth({
      username: this.credentials.adminUsername,
      password: this.credentials.adminPassword,
      grantType: "password",
      clientId: "admin-cli",
    });
  }
}

// Export a singleton instance
export default KeycloakConfig;
