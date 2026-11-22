import type { APIRoute } from 'astro';
import { icon } from '../lib/og';
export const GET:APIRoute=async ()=>new Response(await icon(180),{headers:{'Content-Type':'image/png'}});
