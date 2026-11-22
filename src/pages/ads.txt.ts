import type { APIRoute } from 'astro';
import { publisher, validPublisher } from '../lib/site';
export const GET:APIRoute=()=>new Response(`google.com, ${validPublisher?publisher.slice(3):'pub-XXXXXXXXXXXXXXXX'}, DIRECT, f08c47fec0942fa0\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
