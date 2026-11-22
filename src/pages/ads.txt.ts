import type { APIRoute } from 'astro';
import { publisher, robotsNoIndex, validPublisher } from '../lib/site';

export const GET: APIRoute = () => {
  const record = !robotsNoIndex && validPublisher
    ? `google.com, ${publisher.slice(3)}, DIRECT, f08c47fec0942fa0\n`
    : '';
  return new Response(record, {
    status: record ? 200 : 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
