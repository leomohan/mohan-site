// netlify/functions/auth-login.js
const auth0 = require('auth0-js'); // You'll need to install auth0-js or use a different Auth0 SDK if preferred.

exports.handler = async (event, context) => {
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID } = process.env;

    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
        return {
            statusCode: 500,
            body: 'Auth0 environment variables are not set.',
        };
    }

    const webAuth = new auth0.WebAuth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        redirectUri: `${process.env.URL || 'http://localhost:8888'}/.netlify/functions/auth-callback`,
        responseType: 'token id_token', // Request both access token and ID token
        scope: 'openid profile email', // Standard scopes
        audience: `https://${AUTH0_DOMAIN}/api/v2/`, // Your Auth0 API Audience (optional, but good practice)
    });

    // Redirect to Auth0 Universal Login page
    const authorizeUrl = webAuth.client.buildAuthorizeUrl({
        redirectUri: `${process.env.URL || 'http://localhost:8888'}/.netlify/functions/auth-callback`,
        responseType: 'token id_token',
        scope: 'openid profile email',
        audience: `https://${AUTH0_DOMAIN}/api/v2/`,
    });

    return {
        statusCode: 302, // Redirect
        headers: {
            Location: authorizeUrl,
            'Cache-Control': 'no-cache', // Important for authentication flows
        },
    };
};