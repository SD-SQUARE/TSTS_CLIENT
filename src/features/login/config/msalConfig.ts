import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

const azureClientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;
const azureTenantId = import.meta.env.VITE_AZURE_TENANT_ID as string | undefined;

export const microsoftAuthEnabled = Boolean(azureClientId && azureTenantId);

/**
 * MSAL configuration object - matches working demo SSO exactly
 */
export const msalConfig = {
    auth: {
        clientId: azureClientId || "",
        authority: `https://login.microsoftonline.com/${azureTenantId || "common"}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                if (containsPii) return;
                if (import.meta.env.DEV) {
                    console.log(`[MSAL][${LogLevel[level]}] ${message}`);
                }
            },
            logLevel: LogLevel.Warning,
        },
    },
};

/**
 * Scopes requested during login
 */
export const loginRequest = {
    scopes: ["openid", "profile", "email", "User.Read"],
};

/**
 * Singleton MSAL instance
 */
export const msalInstance = microsoftAuthEnabled
    ? new PublicClientApplication(msalConfig)
    : null;

// MSAL v3 doesn't require manual initialization
// The instance is ready to use immediately
