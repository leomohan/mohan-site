// build-content.js
const { request, gql } = require('graphql-request');
const fs = require('fs');
const path = require('path');

// Get environment variables
const TINA_CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
const TINA_TOKEN = process.env.TINA_TOKEN;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'; // Ensure this matches your branch
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'mohan-site'; // Your GitHub username
const GITHUB_REPO = process.env.GITHUB_REPO || 'mohan-site'; // Your GitHub repo name

const apiUrl = `https://content.tinajs.io/content/${TINA_CLIENT_ID}/github/${GITHUB_BRANCH}`;

// Define your GraphQL query
const GET_HOMEPAGE_DATA = gql`
  query GetHomePageData {
    homepage(relativePath: "homepage.json") { # Matches your path and filename in tina/config.ts
      hero_title
      hero_subtitle
      hero_img
      hero_link
      body # For rich text
    }
  }
`;

async function fetchDataAndBuild() {
  try {
    const headers = {
      'X-Tina-Client-ID': TINA_CLIENT_ID,
      'Authorization': `Bearer ${TINA_TOKEN}`,
    };

    const data = await request({
      url: apiUrl,
      document: GET_HOMEPAGE_DATA,
      variables: {},
      requestHeaders: headers,
    });

    const homepageData = data.homepage;

    // Read your original HTML template
    let htmlContent = fs.readFileSync(path.join(__dirname, 'index.template.html'), 'utf8');

    // Replace placeholders in your HTML with data from Tina
    // This is a very basic replacement. For complex sites, consider a templating engine.
    htmlContent = htmlContent.replace('{{hero_title}}', homepageData.hero_title || '');
    htmlContent = htmlContent.replace('{{hero_subtitle}}', homepageData.hero_subtitle || '');
    htmlContent = htmlContent.replace('{{hero_img}}', homepageData.hero_img || '');
    htmlContent = htmlContent.replace('{{hero_link}}', homepageData.hero_link || '');

    // For rich text, you'll need to convert Tina's rich-text format to HTML
    // This requires @tinacms/markdown utility or similar.
    // For simplicity, let's just use a placeholder for now.
    // You'll need to install: npm install @tinacms/mdx
    // const { markdownToHtml } = require('@tinacms/mdx');
    // const bodyHtml = await markdownToHtml(homepageData.body);
    // htmlContent = htmlContent.replace('{{body_content}}', bodyHtml || '');

    // Write the new HTML to your publish directory
    fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);

    console.log('Homepage built successfully with TinaCMS data!');
  } catch (error) {
    console.error('Error fetching data from TinaCMS or building site:', error);
    process.exit(1); // Exit with error code
  }
}

fetchDataAndBuild();