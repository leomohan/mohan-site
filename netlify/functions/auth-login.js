// netlify/functions/auth-login.js
// No 'auth0-js' import needed here!

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const BASE_URL = process.env.URL || 'http://localhost:8888';

exports.handler = async (event, context) => {
    if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID) {
        return {
            statusCode: 500,
            body: 'Auth0 environment variables (DOMAIN or CLIENT_ID) are not set.',
        };
    }

    // Manually construct the Auth0 Universal Login URL
    const authorizeUrl = `https://${AUTH0_DOMAIN}/authorize?` +
        `response_type=token%20id_token` + // Request both access token and ID token
        `&client_id=${AUTH0_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(`${BASE_URL}/.netlify/functions/auth-callback`)}` + // Auth0 will redirect to THIS function
        `&scope=openid%20profile%20email` + // Standard scopes
        `&audience=https://${AUTH0_DOMAIN}/api/v2/`; // Your Auth0 API Audience (optional, but good practice)

    return {
        statusCode: 302, // Redirect
        headers: {
            Location: authorizeUrl,
            'Cache-Control': 'no-cache', // Important for authentication flows
        },
    };
};