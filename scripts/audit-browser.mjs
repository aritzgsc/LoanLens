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

// Validate centered form geometry in every viewport, including hidden-initially wizard steps.
// Labels remain left aligned intentionally; form blocks and field grids must be balanced.
const formGeometry = () => {
  const problems = [];
  const visible = el => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const box = el => el.getBoundingClientRect();
  if (document.documentElement.scrollWidth > innerWidth + 2)
    problems.push('horizontal document overflow: ' + document.documentElement.scrollWidth + ' > ' + innerWidth);
  for (const [selector, reference] of [
    ['.calculator .wizard', 'main'],
    ['.calculator .wizard form', '.calculator .wizard'],
    ['.calculator .steps', '.calculator .wizard'],
    ['.aid-form', 'main'],
    ['.aid-form .result-grid', '.aid-form'],
    ['.aid-results', 'main'],
    ['.aid-results .result-grid', '.aid-results'],
    ['.tool-app', 'main'],
    ['.tool-app > .tool-pane.card', '.tool-app'],
  ]) {
    const element = document.querySelector(selector);
    const parent = document.querySelector(reference);
    if (!visible(element) || !visible(parent)) continue;
    const child = box(element), outer = box(parent);
    if (child.left < -1 || child.right > innerWidth + 1)
      problems.push(selector + ' exceeds the viewport');
    const left = child.left - outer.left, right = outer.right - child.right;
    if (outer.width - child.width > 35 && Math.abs(left - right) > 16)
      problems.push(selector + ' is off-center by ' + Math.round(left - right) + 'px');
  }
  for (const element of document.querySelectorAll('.calculator .fields, .aid-form .fields, .tool-app .fields')) {
    if (!visible(element) || !visible(element.parentElement)) continue;
    const child = box(element), parent = box(element.parentElement);
    const left = child.left - parent.left, right = parent.right - child.right;
    if (parent.width - child.width > 35 && Math.abs(left - right) > 16)
      problems.push('field grid is off-center by ' + Math.round(left - right) + 'px');
  }
  for (const element of document.querySelectorAll('.calculator input, .calculator select, .aid-form input, .aid-form select, .tool-app input, .tool-app select')) {
    if (!visible(element)) continue;
    const rect = box(element);
    if (rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1))
      problems.push('input/control extends outside the viewport: ' + element.outerHTML.slice(0, 130));
  }
  return problems.slice(0, 16);
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
          // Check CTA contrast explicitly. Automated accessibility audits may miss styles that
          // are hidden behind interactive states or an anchor overriding a button class.
          const badButtons = await page.evaluate(() => {
            const toRgb = (value) => (value.match(/[0-9.]+/g) ?? []).slice(0,3).map(Number);
            const luminance = (rgb) => rgb.map((n) => {
              const channel = n / 255;
              return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
            }).reduce((a,n,i) => a + n * [.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('a.button-link,button.primary,button.secondary')]
              .filter(element => element.getClientRects().length)
              .map(element => {
                const style = getComputedStyle(element);
                const fg = toRgb(style.color), bg = toRgb(style.backgroundColor);
                if (fg.length !== 3 || bg.length !== 3 || style.backgroundColor.includes('0, 0, 0, 0')) return null;
                const light = luminance(fg), dark = luminance(bg);
                return {label:element.textContent.trim().slice(0,70),ratio:(Math.max(light,dark)+.05)/(Math.min(light,dark)+.05)};
              }).filter(item => item && item.ratio < 4.5);
          });
          if (badButtons.length) throw new Error('Insufficient action-text contrast: ' + JSON.stringify(badButtons));
          const geometryProblems = await page.evaluate(formGeometry);
          if (geometryProblems.length) throw new Error('Form layout: ' + geometryProblems.join('; '));
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
            // Cover the additional form states that are not present in the initial screenshots.
            await page.getByRole('button', { name: /Income and household/ }).click();
            const incomeGeometry = await page.evaluate(formGeometry);
            if (incomeGeometry.length) throw new Error('Income step layout: ' + incomeGeometry.join('; '));
            if (colorScheme === 'light' && width !== 768) await capture(prefix + '-income-step');
            await page.getByRole('button', { name: /Goals/ }).click();
            const goalGeometry = await page.evaluate(formGeometry);
            if (goalGeometry.length) throw new Error('Goal step layout: ' + goalGeometry.join('; '));
            if (colorScheme === 'light' && width !== 768) await capture(prefix + '-goals-step');
            await page.getByRole('button', { name: /Loans/ }).click();
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
            const resultGeometry = await page.evaluate(formGeometry);
            if (resultGeometry.length) throw new Error('Aid comparison layout: ' + resultGeometry.join('; '));
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
// Print a short, actionable sample of offending selectors in CI; the full report is saved to browser.json.
const examples = new Set(report.pages.flatMap(page => page.violations
  .filter(issue => ['serious','critical'].includes(issue.impact))
  .flatMap(issue => issue.targets.slice(0,5).map(target => issue.id + ': ' + target.join(' > ')))));
for (const target of [...examples].slice(0,25)) console.error('Failing element: ' + target);
if (report.failures.length || highImpact.length) process.exitCode = 1;
