import { z, defineCollection, reference } from "astro:content";

const blog = defineCollection({
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
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string().trim(),
    image: z.string().optional(),
    headerimage: z.string().optional(),
    draft: z.boolean().optional(),
    tips: z.array(reference("tips"))
  }),
});

const tips = defineCollection({
  schema: z.object({
    name: z.string(),
    description: z.string(),
    images: z.string().optional(),
    address: z.string().optional(),
    website: z.string().optional(),
    cost: z.string().optional(),
  }),
});

export const collections = { blog, guides, tips };


