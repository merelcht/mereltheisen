import { z, defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string().trim(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    publishDate: z.string().transform((str) => new Date(str)),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string().trim(),
    image: image(),
    headerimage: z.string().optional(),
    draft: z.boolean().optional(),
    tips: z.array(reference("tips"))
  }),
});

const tips = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tips" }),
  schema: ({ image }) => z.object({
    name: z.string(),
    description: z.string(),
    images: image().optional(),
    address: z.string().optional(),
    website: z.string().optional(),
    cost: z.string().optional(),
  }),
});

export const collections = { blog, guides, tips };


