import type { Collection } from "tinacms";

export const TeamCollection: Collection = {
  name: "team",
  label: "Team Members",
  path: "src/content/team",
  format: "md",
  fields: [
    {
      type: "string",
      name: "name",
      label: "Name",
      isTitle: true,
      required: true,
    },
    {
      name: "role",
      label: "Role",
      type: "string",
      description: "E.g. Executive Director, Programs Director, Volunteer Lead.",
    },
    {
      name: "avatar",
      label: "Avatar",
      type: "image",
      description: "Square headshot, 200×200 recommended.",
    },
    {
      name: "bio",
      label: "Bio",
      type: "rich-text",
      description: "Short biography shown on the Team page.",
    },
    {
      name: "email",
      label: "Email",
      type: "string",
      description: "Optional. Shown on the team page if provided.",
    },
    {
      name: "order",
      label: "Display Order",
      type: "number",
      description: "Lower numbers appear first. Leave blank for alphabetical.",
    },
  ],
}
