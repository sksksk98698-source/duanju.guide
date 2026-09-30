import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.string().optional().default('2026-03-01'),
  updatedDate: z.string().optional().default('2026-09-30'),
  category: z.string().optional(),
  categoryName: z.string().optional(),
  categoryUrl: z.string().optional(),
  cluster: z.string().optional(),
  clusterName: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional().default('P1'),
  intent: z.string().optional(),
  author: z.string().optional().default('黄果短剧技术团队'),
  showGSY: z.boolean().optional().default(false),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
})

export const collections = {
  guide: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guide' }),
    schema: articleSchema,
  }),
  problems: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/problems' }),
    schema: articleSchema,
  }),
  compare: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/compare' }),
    schema: articleSchema,
  }),
  gsy: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gsy' }),
    schema: articleSchema,
  }),
  about: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/about' }),
    schema: articleSchema,
  }),
}
