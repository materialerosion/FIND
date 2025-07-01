/*
 * Configuration for MSAL (Microsoft Authentication Library)
 */
import { LogLevel } from "@azure/msal-browser";

// Get environment variables with explicit defaults and logging for debugging
const clientId = process.env.REACT_APP_AZURE_CLIENT_ID;
const tenantId = process.env.REACT_APP_AZURE_TENANT_ID;

// Debug logging for environment variables
if (!clientId) {
    console.error("REACT_APP_AZURE_CLIENT_ID is not defined in environment variables");
}
if (!tenantId) {
    console.error("REACT_APP_AZURE_TENANT_ID is not defined in environment variables");
}

/**
 * Configuration object for the MSAL instance
 * Values are pulled from environment variables for security
 */
export const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '',
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || ''}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
            logLevel: LogLevel.Info
        }
    }
};

/**
 * Scopes that will be requested during login
 * For more information about scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent
 */
export const loginRequest = {
    scopes: ["User.Read"] // Add more scopes as needed
};

/**
 * Graph API endpoints for user data
 */
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
}; 