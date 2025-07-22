const fs = require('fs');
const path = require('path');

// Import the TinaCMS client.
// This path assumes your build-content.js is at the root of your project
// and the generated client is in tina/__generated__/client.js
const { client } = require('./tina/__generated__/client');

// Define your GraphQL query to fetch homepage data.
// Ensure this query matches your schema defined in tina/config.ts
// and the relativePath matches where your homepage content will be stored (e.g., content/homepage.json)
const GET_HOMEPAGE_DATA = `
  query GetHomepageData {
    homepage(relativePath: "homepage.json") {
      hero_title
      hero_subtitle
      hero_img
      hero_link
      body
    }
  }
`;

async function fetchDataAndBuild() {
  try {
    console.log('Starting site build process...');

    // Fetch data from Tina Cloud using the generated client
    // Ensure NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN are set as environment variables
    const data = await client.request(GET_HOMEPAGE_DATA, { variables: {} });
    const homepageData = data.homepage;

    if (!homepageData) {
      console.warn('No homepage data found. Building with empty content.');
      // You might want to handle this more gracefully, e.g., use default values
      // or throw an error if content is strictly required.
    } else {
      console.log('Homepage data fetched successfully:', JSON.stringify(homepageData, null, 2));
    }

    // Define the path to your HTML template
    const templatePath = path.join(process.cwd(), 'index.template.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders in the HTML template with fetched data
    // Ensure your index.template.html has these placeholders (e.g., {{hero_title}})
    htmlContent = htmlContent.replace(
      '{{hero_title}}',
      homepageData?.hero_title || 'Default Hero Title'
    );
    htmlContent = htmlContent.replace(
      '{{hero_subtitle}}',
      homepageData?.hero_subtitle || 'Default Hero Subtitle'
    );
    htmlContent = htmlContent.replace(
      '{{hero_img}}',
      homepageData?.hero_img || 'https://placehold.co/1200x600/aabbcc/ffffff?text=Placeholder+Image' // Placeholder if no image
    );
    htmlContent = htmlContent.replace(
      '{{hero_link}}',
      homepageData?.hero_link || '#' // Default link
    );

    // For rich-text, you might need a simple markdown-to-HTML converter
    // For a basic setup, we'll just use the raw text or an empty string
    // If 'body' is rich-text, it will be a JSON object. You'll need a renderer.
    // For simplicity, we'll stringify it or use a basic placeholder.
    // A proper rich-text renderer would be more complex and usually involves a client-side library.
    htmlContent = htmlContent.replace(
      '{{body}}',
      homepageData?.body ? JSON.stringify(homepageData.body, null, 2) : 'Default body content.'
    );


    // Define the output directory and file path
    const outputDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }
    const outputPath = path.join(outputDir, 'index.html');

    // Write the final HTML content to the output file
    fs.writeFileSync(outputPath, htmlContent);

    console.log('Homepage built successfully with TinaCMS data!');
  } catch (error) {
    console.error('Error fetching data from TinaCMS or building site:', error);
    // Exit with a non-zero code to indicate build failure in Netlify
    process.exit(1);
  }
}

// Execute the build function
fetchDataAndBuild();