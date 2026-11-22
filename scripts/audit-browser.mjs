import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [origin = 'http://localhost:4321', output = 'audit-artifacts', dist = 'dist'] = process.argv.slice(2);
const reportDir = resolve(output);
const widths = [390, 768, 1280];
const heights = { 390: 844, 768: 1024, 1280: 800 };
const routes = ['/', '/calculator/', '/deadlines/', '/tools/', '/tools/married-rap-impact/',
  '/tools/compare-college-aid-offers/', '/guides/compare-college-financial-aid-offers/', '/tools/parent-plus-consolidation-checker/', '/tools/pslf-payment-tracker/', '/rap-payment-by-income/',
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
      const context = await browser.newContext({ colorScheme, viewport: { width, height: heights[width] }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      for (const route of allPages) {
        try {
          await visit(page, route);
          const prefix = [routeName(route), colorScheme, width].join('-');
          const capture = async label => {
            for (const [view, fullPage] of [['fold', false], ['full', true]]) {
              const file = label + '-' + view + '.png';
              await page.screenshot({ path: join(reportDir, file), fullPage, animations: 'disabled' });
              report.screenshots.push(file);
            }
          };
          if (routes.includes(route)) await capture(prefix);
          const metrics = await page.evaluate(textMetrics);
          const axe = await new AxeBuilder({ page }).analyze();
          report.pages.push({ route, width, colorScheme, ...metrics,
            violations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) })),
          });
          if (route === '/') {
            await page.getByRole('link', { name: 'Estimate loan payments', exact: true }).press('Enter');
            await page.waitForURL(url => url.hash === '#repayment-estimator');
            await page.getByRole('heading', { name: 'Student loan repayment calculator', exact: true }).waitFor();
            await page.getByRole('link', { name: /Choosing a college/ }).waitFor();
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
          if (route === '/tools/compare-college-aid-offers/') {
            const cost = page.getByRole('group', { name: 'School A', exact: true })
              .getByRole('textbox', { name: 'Annual cost of attendance (USD)' });
            await page.getByRole('button', { name: 'Use example offers' }).press('Enter');
            await page.getByRole('region', { name: 'School A', exact: true })
              .getByText('$12,500.00', { exact: true }).waitFor();
            await page.getByRole('region', { name: 'School B', exact: true })
              .getByText('$13,000.00', { exact: true }).waitFor();
            await capture(prefix + '-example');
            const resultsAxe = await new AxeBuilder({ page }).analyze();
            report.pages.push({ route, width, colorScheme, state: 'example', ...await page.evaluate(textMetrics),
              violations: resultsAxe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) })),
            });
            await cost.fill('-40');
            await page.getByRole('button', { name: 'Compare offers' }).press('Enter');
            await page.getByRole('alert').getByText('Check the highlighted amounts before comparing.').waitFor();
            await page.locator('#aid-0-cost:focus[aria-invalid="true"]').waitFor();
            await page.getByRole('button', { name: 'Reset', exact: true }).press('Enter');
            if (await cost.inputValue() !== '') throw new Error('Aid comparison reset did not clear the cost field');
            await page.getByText('Compare two offers to see what you may have left to cover.').waitFor();
          }
        } catch (error) {
          report.failures.push({ route, width, colorScheme, message: String(error) });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(join(reportDir, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
}
const highImpact = report.pages.flatMap(page => page.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical'));
console.log('Captured ' + report.screenshots.length + ' screenshots; ' + highImpact.length + ' serious/critical axe findings; ' + report.failures.length + ' audit errors.');
for (const message of new Set(report.failures.map(failure => failure.message))) console.error(message);
for (const id of new Set(highImpact.map(issue => issue.id))) console.error('Accessibility finding: ' + id);
if (report.failures.length || highImpact.length) process.exitCode = 1;
