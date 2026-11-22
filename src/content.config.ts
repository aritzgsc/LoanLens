import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const pages = defineCollection({
  loader:glob({base:'./src/content/pages', pattern:'**/*.mdx'}),
  schema:z.object({
    title:z.string(), description:z.string(), category:z.enum(['guide','trust']),
    status:z.enum(['draft','reviewed']), verified:z.string(), updated:z.string(),
  reviewed:z.string().optional(), related:z.array(z.string()).default([]),
  shortAnswer:z.string().optional()
  }).superRefine((value,ctx)=>{
    if(value.status==='reviewed' && !value.reviewed) ctx.addIssue({
      code:'custom', path:['reviewed'], message:'Add a review date when changing status to reviewed.'
    });
  })
});
export const collections = { pages };
