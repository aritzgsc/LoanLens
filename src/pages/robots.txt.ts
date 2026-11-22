import type { APIRoute } from 'astro';
import { robotsNoIndex } from '../lib/site';
export const GET:APIRoute = ({site}) => new Response(robotsNoIndex?'User-agent: *\nDisallow: /\n':
  `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap-index.xml',site).href}\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
