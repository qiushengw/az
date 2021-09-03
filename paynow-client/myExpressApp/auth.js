const msal = require('@azure/msal-node');

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */



const msalConfig = {
    auth: {
        clientId: "c8d8f714-767e-46f1-9b20-0eeb2576d717",
        authority: "https://login.microsoftonline.com/4f3ecf0a-0671-4764-95c7-3e20bf1f4b69",
        clientSecret: "5a.B.spwh35u5ufbnZLwFW5P0-~0iEby.w"
    }
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'. For more, visit:
 * https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
const tokenRequest = {
    scopes: ['api://389fc556-2936-46b4-8ccf-4311161ff05d/.default']
};

const apiConfig = {
    uri: "https://apimsmbc.azure-api.net/paynow/paynow-qr/v1/qrcode"
};

/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Acquires token with client credentials.
 * @param {object} tokenRequest
 */
async function getToken(tokenRequest) {
    return await cca.acquireTokenByClientCredential(tokenRequest);
}

module.exports = {
    apiConfig: apiConfig,
    tokenRequest: tokenRequest,
    getToken: getToken
};