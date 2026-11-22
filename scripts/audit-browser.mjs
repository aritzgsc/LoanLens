import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const [origin = 'http://localhost:4321', output = 'audit-artifacts', dist = 'dist'] = process.argv.slice(2);
const reportDir = resolve(output);
const widths = [390, 768, 1280];
const heights = { 390: 844, 768: 1024, 1280: 800 };
const routes = ['/', '/calculator/', '/deadlines/', '/tools/', '/tools/married-rap-impact/',
  '/tools/parent-plus-consolidation-checker/', '/tools/pslf-payment-tracker/', '/rap-payment-by-income/',
  '/guides/', '/guides/compare-student-loan-repayment/', '/guides/save-ended-what-now/', '/guides/rap-vs-ibr/', '/guides/rap-and-pslf/'];
const routeName = path => path === '/' ? 'home' : path.slice(1, -1).replaceAll('/', '--');
const allPages = (await readdir(resolve(dist), { recursive: true }))
  .map(path => path.replaceAll('\\', '/'))
  .filter(path => path === 'index.html' || path.endsWith('/index.html'))
  .map(path => '/' + path.slice(0, -'index.html'.length))
  .sort();

await mkdir(reportDir, { recursive: true });
const browser = await chromium.launch({ channel: process.env.AUDIT_BROWSER_CHANNEL });
const report = { origin, urls: allPages, pages: [], screenshots: [], failures: [] };
const textMetrics = () => {
  const { document, innerHeight } = globalThis;
  const wordCount = text => [...new Intl.Segmenter('en-US', { granularity: 'word' }).segment(text)]
    .filter(segment => segment.isWordLike).length;
  const main = document.querySelector('main');
  const body = main?.querySelector('article.article-body');
  const firstInput = main?.querySelector('input');
  const bounds = firstInput?.getBoundingClientRect();
  return {
    words: wordCount(main?.innerText ?? ''),
    articleWords: body ? wordCount(body.innerText) : null,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content ?? '',
    h1: document.querySelectorAll('h1').length,
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(script => {
      try { JSON.parse(script.textContent); return true; } catch { return false; }
    }),
    firstInputVisible: bounds ? bounds.top >= 0 && bounds.bottom <= innerHeight : null,
    adSlots: [...document.querySelectorAll('.ad-slot')].map(slot => ({
      kind: slot.getAttribute('data-slot-kind'),
      height: slot.getBoundingClientRect().height,
      active: slot.hasAttribute('data-ad-active'),
    })),
  };
};
const visit = async (page, route) => {
  const response = await page.goto(new URL(route, origin).href, { waitUntil: 'load' });
  if (response?.status() !== 200) throw new Error(route + ' returned HTTP ' + response?.status());
  await page.evaluate(() => globalThis.document.fonts.ready);
};
try {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of widths) {
      const page = await browser.newPage({ colorScheme, viewport: { width, height: heights[width] }, reducedMotion: 'reduce' });
      for (const route of allPages) {
        try {
          await visit(page, route);
          const axe = await new AxeBuilder({ page }).analyze();
          const metrics = await page.evaluate(textMetrics);
          report.pages.push({ route, width, colorScheme, ...metrics,
            violations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) })),
          });
          if (!routes.includes(route)) continue;
          const prefix = [routeName(route), colorScheme, width].join('-');
          const capture = async label => {
            for (const [view, fullPage] of [['fold', false], ['full', true]]) {
              const file = label + '-' + view + '.png';
              await page.screenshot({ path: join(reportDir, file), fullPage, animations: 'disabled' });
              report.screenshots.push(file);
            }
          };
          await capture(prefix);
          if (route === '/') {
            await page.getByRole('button', { name: 'Use example borrower' }).press('Enter');
            await page.getByText('Example borrower loaded.', { exact: true }).waitFor();
            await page.evaluate(() => globalThis.scrollTo(0, 0));
            await capture(prefix + '-example');
            const resultsAxe = await new AxeBuilder({ page }).analyze();
            report.pages.push({ route, width, colorScheme, state: 'example', ...await page.evaluate(textMetrics),
              violations: resultsAxe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) })),
            });
            await page.getByRole('button', { name: 'Reset', exact: true }).press('Enter');
            await page.getByText('Example borrower loaded.', { exact: true }).waitFor({ state: 'hidden' });
          }
        } catch (error) {
          report.failures.push({ route, width, colorScheme, message: String(error) });
        }
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(join(reportDir, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
}
const highImpact = report.pages.flatMap(page => page.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical'));
console.log('Captured ' + report.screenshots.length + ' screenshots; ' + highImpact.length + ' serious/critical axe findings; ' + report.failures.length + ' audit errors.');
if (report.failures.length || highImpact.length) process.exitCode = 1;
