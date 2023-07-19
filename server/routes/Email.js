const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
var { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

router.use(bodyParser.json());

// For node-fetch using import
let fetch;
(async () => {
  const { default: fetchModule } = await import("node-fetch");
  fetch = fetchModule;
})();

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri:
      "https://login.microsoftonline.com/ac194b61-7219-4e00-af30-fbfedb1ae1ab/.well-known/openid-configuration/jwks",
  }),
  audience: "bd3aa349-6910-4d09-b47e-e9e67b3d9041",
  issuer:
    "https://login.microsoftonline.com/ac194b61-7219-4e00-af30-fbfedb1ae1ab/v2.0",
  algorithms: ["RS256"],
});

router.get("/data", async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];

    // HTTP request
    const graphResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/messages?$select=sender,subject",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await graphResponse.json();
    res.json(data);
  } catch (error) {
    console.log("ERROR: ", error);
  }
});

module.exports = router;
