import KcAdminClient from "@keycloak/keycloak-admin-client";

class KeycloakConfig {
  private static instance: KeycloakConfig;
  private kcAdminClient: KcAdminClient;

  private constructor() {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_URL || "http://localhost:8080",
      realmName: "master",
    });
  }

  public static getInstance(): KeycloakConfig {
    if (!KeycloakConfig.instance) {
      KeycloakConfig.instance = new KeycloakConfig();
    }
    return KeycloakConfig.instance;
  }

  public getAdminClient(): KcAdminClient {
    return this.kcAdminClient;
  }

  public async authenticate() {
    await this.kcAdminClient.auth({
      username: process.env.KEYCLOAK_ADMIN || "admin",
      password: process.env.KEYCLOAK_ADMIN_PASSWORD || "admin",
      grantType: "password",
      clientId: "admin-cli",
    });
  }
}

// Export a singleton instance
export default KeycloakConfig;
