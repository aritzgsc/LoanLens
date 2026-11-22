// Keep Astro, the sitemap and the post-build checks on the same public origin.
export function siteSettings(env) {
  const onVercel = Boolean(env.VERCEL_ENV);
  const origin = env.PUBLIC_SITE_URL?.trim()
    || (onVercel ? 'https://myloanlens.vercel.app' : 'https://loanlens.example');
  const noindex = env.PUBLISH_DRAFTS === 'true' || (onVercel && env.VERCEL_ENV !== 'production')
    || new URL(origin).hostname.endsWith('.example');
  return { origin, noindex };
}
