const OktaJwtVerifier = require('@okta/jwt-verifier');

const apiScope = [
    {
        "scope": "openid"  // can customize this to add custom scopes...
    }
];

var generatePolicyStatement = function (methodArn, action) {
    'use strict';
    // Generate an IAM policy statement
    var statement = {};
    statement.Action = 'execute-api:Invoke';
    statement.Effect = action;
    statement.Resource = methodArn;
    return statement;
};

var generatePolicy = function (principalId, policyStatements) {
    'use strict';
    // Generate a fully formed IAM policy
    var authResponse = {};
    authResponse.principalId = principalId;
    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = policyStatements;
    authResponse.policyDocument = policyDocument;
    return authResponse;
};

var verifyAccessToken = function (accessToken) {
    'use strict';
    /*
    * Verify the access token with your Identity Provider here (check if your
    * Identity Provider provides an SDK).
    *
    * This example assumes this method returns a Promise that resolves to
    * the decoded token, you may need to modify your code according to how
    * your token is verified and what your Identity Provider returns.
    */
    const oktaJwtVerifier = new OktaJwtVerifier({
        issuer: process.env.ISSUER
    });

    return oktaJwtVerifier.verifyAccessToken(accessToken, process.env.AUDIENCE)
        .then(jwt => {
            console.log('token is valid');
            return jwt;
        }).catch(err => console.warn('token failed validation'));
};

var generateIAMPolicy = function (scopeClaims, methodArn) {
    'use strict';
    var policyStatements = [];
    for (var i = 0; i < apiScope.length; i++) {
        if (scopeClaims.indexOf(apiScope[i].scope) > -1) {
            policyStatements.push(
                generatePolicyStatement(methodArn, "Allow")
            );
        }
    }

    // Check if no policy statements are generated, if so, create default deny all policy statement
    if (policyStatements.length === 0) {
        var policyStatement = generatePolicyStatement("*", "*", "*", "*", "Deny");
        policyStatements.push(policyStatement);
    }

    return generatePolicy('<principalId>', policyStatements);
};

exports.handler = async function (event, context) {
    // Declare Policy
    var iamPolicy = null;
    console.log("Payload: " + JSON.stringify(event));
    console.log("Method Arn: " + event.methodArn);

    // Capture raw token and trim 'Bearer ' string, if present
    var token = event.authorizationToken.replace("Bearer ", "");

    // Validate token
    await verifyAccessToken(token).then(data => {
        // Retrieve token scopes
        var scopeClaims = data.claims.scp;
        // Generate IAM Policy
        iamPolicy = generateIAMPolicy(scopeClaims, event.methodArn);
    }).catch(err => {
        console.log(err);
        // Generate default deny all policy statement if there is an error
        var policyStatements = [];
        var policyStatement = generatePolicyStatement("*", "*", "*", "*", "Deny");
        policyStatements.push(policyStatement);
        iamPolicy = generatePolicy('user', policyStatements);
    });

    return iamPolicy;
};