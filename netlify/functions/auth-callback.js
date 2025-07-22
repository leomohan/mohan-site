// netlify/functions/auth-callback.js
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken
const fetch = require('node-fetch'); // npm install node-fetch@2 for Netlify Functions, or just use built-in fetch if Node.js 18+

exports.handler = async (event, context) => {
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, GITHUB_CMS_ACCESS_TOKEN, URL } = process.env;

    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !GITHUB_CMS_ACCESS_TOKEN) {
        return {
            statusCode: 500,
            body: 'Auth0 or GitHub environment variables are not set.',
        };
    }

    const params = new URLSearchParams(event.queryStringParameters);
    const idToken = params.get('id_token'); // Get the ID token from Auth0 callback

    if (!idToken) {
        return {
            statusCode: 400,
            body: 'ID Token not found in callback.',
        };
    }

    try {
        // 1. Verify Auth0 ID Token
        // You might need to fetch the JWKS for a more robust verification in production.
        // For simplicity, we'll verify the signature directly if you have a known secret,
        // but for Auth0 tokens, it's better to verify against their JWKS endpoint.
        // A more secure way to verify Auth0 tokens:
        // const jwksClient = require('jwks-rsa');
        // const client = jwksClient({ jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json` });
        // const getKey = (header, callback) => { client.getSigningKey(header.kid, (err, key) => { const signingKey = key.publicKey || key.rsaPublicKey; callback(null, signingKey); }); };
        // const decoded = await new Promise((resolve, reject) => {
        //     jwt.verify(idToken, getKey, { audience: AUTH0_CLIENT_ID, issuer: `https://${AUTH0_DOMAIN}/` }, (err, decoded) => {
        //         if (err) return reject(err);
        //         resolve(decoded);
        //     });
        // });

        // For a simpler (less secure for prod without JWKS check) initial test:
        // You generally don't verify Auth0 ID tokens with a "secret" directly like this.
        // They are signed with a public/private key pair.
        // The robust way involves fetching the JWKS.
        // For this example, let's assume `jwt.decode` gives us enough info to proceed for now.
        // **For production, replace with proper JWKS verification.**
        const decoded = jwt.decode(idToken);
        if (!decoded) {
            throw new Error('Could not decode ID Token.');
        }

        // Optional: Basic validation (e.g., check email domain or roles)
        // Example: Only allow users with a specific email domain
        // if (!decoded.email.endsWith('@yourdomain.com')) {
        //     return { statusCode: 403, body: 'Access Denied: Invalid email domain.' };
        // }

        // 2. Prepare Decap CMS Session Token
        // Decap CMS expects a session object. The 'token' property is critical.
        // This token will be used by Decap CMS to interact with GitHub via this backend.
        const cmsAuthToken = jwt.sign(
            {
                // You can include user data from Auth0 here if needed for CMS UI
                name: decoded.name || decoded.nickname || decoded.email,
                email: decoded.email,
                // The 'githubToken' here is your pre-generated GITHUB_CMS_ACCESS_TOKEN
                // This is the key that allows Decap CMS to make Git calls via your function.
                githubToken: GITHUB_CMS_ACCESS_TOKEN,
                // You can also add roles/permissions if your CMS logic needs them
                // roles: decoded['https://your-namespace/roles'] || [],
            },
            // Use a secret known only to your Netlify function and Decap CMS
            // (Decap CMS doesn't directly use this secret for this flow,
            // but you can use it to sign the token for internal verification if needed)
            // For simplicity here, we'll use a generic string.
            // In a production environment, this should be a strong, unique secret.
            AUTH0_CLIENT_SECRET, // Using client secret for signing, but consider a dedicated secret
            { expiresIn: '1h' } // Token expiry
        );

        // 3. Redirect back to Decap CMS admin
        const redirectUrl = `${URL || 'http://localhost:8888'}/admin/#/auth?token=${cmsAuthToken}`;

        return {
            statusCode: 302,
            headers: {
                Location: redirectUrl,
                'Cache-Control': 'no-cache',
            },
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return {
            statusCode: 500,
            body: `Authentication failed: ${error.message}`,
        };
    }
};