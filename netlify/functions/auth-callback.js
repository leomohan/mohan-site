// netlify/functions/auth-callback.js
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // npm install node-fetch@2 for Netlify Functions, or just use built-in fetch if Node.js 18+

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const GITHUB_CMS_ACCESS_TOKEN = process.env.GITHUB_CMS_ACCESS_TOKEN;
const BASE_URL = process.env.URL || 'http://localhost:8888';

exports.handler = async (event, context) => {
    const { queryStringParameters } = event;
    const idToken = queryStringParameters.id_token;

    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !GITHUB_CMS_ACCESS_TOKEN) {
        return {
            statusCode: 500,
            body: 'Auth0 or GitHub environment variables are not set.',
        };
    }

    if (!idToken) {
        return {
            statusCode: 400,
            body: 'ID Token not found in callback parameters.',
        };
    }

    try {
        // 1. Verify Auth0 ID Token (CRITICAL FOR PRODUCTION - using jwt.decode is INSECURE without JWKS verification)
        // For production, implement robust JWKS verification here:
        /*
        const jwksRsa = require('jwks-rsa');
        const client = jwksRsa({ jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json` });
        const signingKey = await client.getSigningKey(jwt.decode(idToken, { complete: true }).header.kid);
        const publicKey = signingKey.publicKey || signingKey.rsaPublicKey;
        const decodedAuth0Token = jwt.verify(idToken, publicKey, { audience: AUTH0_CLIENT_ID, issuer: `https://${AUTH0_DOMAIN}/` });
        */
        // Simplified decode for testing (INSECURE FOR PRODUCTION)
        const decodedAuth0Token = jwt.decode(idToken);


        if (!decodedAuth0Token) {
            throw new Error('Failed to decode Auth0 ID Token.');
        }

        // Optional: Basic authorization check (e.g., based on email or roles)
        // if (!decodedAuth0Token.email.endsWith('@yourdomain.com')) {
        //     return { statusCode: 403, body: 'Access Denied: You are not authorized.' };
        // }

        // 2. Create Decap CMS session token
        const cmsSessionToken = jwt.sign(
            {
                name: decodedAuth0Token.name || decodedAuth0Token.nickname || decodedAuth0Token.email,
                email: decodedAuth0Token.email,
                githubToken: GITHUB_CMS_ACCESS_TOKEN, // Your GitHub PAT
            },
            AUTH0_CLIENT_SECRET, // Using Auth0 Client Secret as a signing key for this token (consider a dedicated secret for production)
            { expiresIn: '1h' }
        );

        // 3. Redirect back to Decap CMS admin with the token
        const redirectUrl = `${BASE_URL}/admin/#/auth?token=${cmsSessionToken}`;

        return {
            statusCode: 302,
            headers: {
                Location: redirectUrl,
                'Cache-Control': 'no-cache',
            },
        };

    } catch (error) {
        console.error('Auth0 Callback Error:', error);
        return {
            statusCode: 500,
            body: `Authentication failed: ${error.message}`,
        };
    }
};