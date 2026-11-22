// Keep Astro, the sitemap and the post-build checks on the same public origin.
export function siteSettings(env) {
  const onVercel = Boolean(env.VERCEL_ENV);
  const configured = env.PUBLIC_SITE_URL?.trim();
  const legacyHost = configured && new URL(configured).hostname === 'loan-lens.vercel.app';
  const productionOrigin = 'https://loan--lens.vercel.app';
  const origin = onVercel && (!configured || legacyHost)
    ? productionOrigin
    : configured || 'https://loanlens.example';
  const noindex = env.PUBLISH_DRAFTS === 'true' || (onVercel && env.VERCEL_ENV !== 'production')
    || new URL(origin).hostname.endsWith('.example');
  return { origin, noindex };
}
