import { defineConfig } from "tinacms";

const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public", // <--- UPDATED! This points to your /public folder
  },
  media: {
    tina: {
      mediaRoot: "uploads", // This will put uploaded images in /public/uploads/
      publicFolder: "public", // <--- UPDATED! This points to your /public folder
    },
  },
  schema: {
    collections: [
      {
        name: "homepage",
        label: "Home Page",
        path: "content",
        format: "json",
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
            type: "image",
            name: "hero_img",
            label: "Latest Book Image",
          },
          {
            type: "string",
            name: "hero_link",
            label: "Amazon Link",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Page Body Content",
          },
        ],
        ui: {
          router: ({ document }) => `/`,
          allowedActions: {
            create: false,
            delete: false,
          },
          filename: {
            readonly: true,
            slugify: ({ name }) => "homepage",
          },
        },
      },
    ],
  },
});