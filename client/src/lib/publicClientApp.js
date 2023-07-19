import { config } from "../config.js";
import { PublicClientApplication } from "@azure/msal-browser";

// MSAL Instance
export const publicClientApplication = new PublicClientApplication({
  auth: {
    clientId: config.appID,
    redirectUrl: config.redirectUrl,
    authority: config.authority,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCooki: true,
  },
});
