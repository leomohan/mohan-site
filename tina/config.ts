import { defineConfig } from "tinacms";

const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID, // Use the new ENV var name
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: ".", // Your site's root as public folder
  },
  media: {
    tina: {
      mediaRoot: "uploads", // Images will go into publicFolder/uploads
      publicFolder: ".", // Base public folder is root
    },
  },
  schema: {
    collections: [
      {
        name: "homepage", // Unique name for your collection
        label: "Home Page",
        path: "content", // Tina will store data for this in 'content/homepage.json'
        format: "json",  // Or 'md', 'mdx', 'yaml'
        fields: [
          {
            type: "string",
            name: "hero_title",
            label: "Hero Title",
            required: true,
          },
          {
            type: "string",
            name: "hero_subtitle",
            label: "Hero Subtitle",
          },
          {
            type: "image", // Tina's image widget
            name: "hero_img",
            label: "Latest Book Image",
          },
          {
            type: "string",
            name: "hero_link",
            label: "Amazon Link",
          },
          // If you have a main rich text area for the body of the page:
          {
            type: "rich-text", // This is Tina's WYSIWYG editor
            name: "body",
            label: "Page Body Content",
          },
        ],
        // Since this is a single instance (homepage), we use 'is-singleton'
        // Tina will manage a file like content/homepage.json based on this schema.
        ui: {
          router: ({ document }) => `/`, // When you edit this, it routes to your homepage
          allowedActions: {
            create: false, // Don't allow creating new homepages
            delete: false, // Don't allow deleting the homepage
          },
          // This tells Tina this is a single entry.
          // The data will be stored at path + name + .format (e.g., content/homepage.json)
          filename: {
            // Your homepage content will be in 'content/homepage.json'
            // You can adjust this path if you want it elsewhere
            readonly: true,
            slugify: ({ name }) => "homepage",
          },
        },
      },
    ],
  },
});