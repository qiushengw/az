const msal = require('@azure/msal-node');

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */

const msalConfig = {
    auth: {
        clientId: "421609d7-f721-446e-83d6-3b84dad63c69",
        authority: "https://login.microsoftonline.com/d16c6dd4-60c3-49cf-be51-380531796a03",
        clientSecret: "3XKl65XH.vS3Uxj6.-CqEdg.old53l~9h5"
    }
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'. For more, visit:
 * https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
const tokenRequest = {
    scopes: ['api://3d259433-b03d-4769-833c-67553fbc3d39/.default']
};

const apiConfig = {
    uri: "https://smbcapimtest.azure-api.net/paynow/paynow-qr/v1/qrcode"
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