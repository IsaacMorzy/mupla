import type { Collection } from "tinacms";
import { youTubeEmbedTemplate } from "../../src/components/mdx/YouTubeEmbed.template";

export const BlogCollection: Collection = {

  name: "blog",
  label: "Blogs",
  path: "src/content/blog",
  format: "mdx",
  ui: {
    router({ document }) {
      return `/blog/${document._sys.filename}`;
    },
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "string",
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      description: "Optional. Used for blog index filters. Examples: Reflection, Programs, Community, Ramadan, Zakat.",
    },
    {
      name: "author",
      label: "Author",
      type: "string",
      description: "Optional. Enter a team member's name (must match a name in the Team collection). If blank, defaults to 'mupla community'.",
    },
    {
      name: "pubDate",
      label: "Publication Date",
      type: "datetime",
    },
    {
      name: "updatedDate",
      label: "Updated Date",
      type: "datetime",
    },
    {
      name: "publishStatus",
      label: "Publish Status",
      type: "string",
      description: "Controls visibility on the site. Defaults to 'published' for backward compatibility.",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Archived", value: "archived" },
      ],
      defaultValue: "published",
      ui: {
        component: "select",
      },
    },
    {
      name: "heroImage",
      label: "Hero Image",
      type: "image",
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [youTubeEmbedTemplate],
    },
  ],
}
