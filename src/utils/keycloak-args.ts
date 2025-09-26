#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { KeycloakAdminCredentials } from "../types/keycloak-admin-credentials.ts";

export const getKeycloakAdminCredentials =
  async (): Promise<KeycloakAdminCredentials> => {
    // Define and parse the command-line arguments
    const argv = await yargs(hideBin(process.argv))
      .option("keycloak-url", {
        describe: "Keycloak URL",
        type: "string",
        demandOption: false,
      })
      .option("keycloak-admin", {
        describe: "Keycloak admin username",
        type: "string",
        demandOption: false,
      })
      .option("keycloak-admin-password", {
        describe: "Keycloak admin password",
        type: "string",
        demandOption: false,
      })
      .help().argv;

    // Return the parsed arguments as an object
    return {
      baseUrl: argv["keycloak-url"],
      adminUsername: argv["keycloak-admin"],
      adminPassword: argv["keycloak-admin-password"],
    };
  };
