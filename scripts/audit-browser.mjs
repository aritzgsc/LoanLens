import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [origin = 'http://localhost:4321', output = 'audit-artifacts', dist = 'dist'] = process.argv.slice(2);
const reportDir = resolve(output);
const widths = [320, 390, 768, 1024, 1440];
const heights = { 320: 740, 390: 844, 768: 1024, 1024: 768, 1440: 900 };
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
const report = { origin, urls: allPages, pages: [], screenshots: [], assets: [], failures: [] };
const inspectedAssets = new Set();
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
// Verify vertical alignment only: inputs in the same visual row must start at the
// same y-coordinate, even when neighboring labels wrap onto additional lines.
const fieldRowAlignment = () => {
  const failures = [];
  for (const grid of document.querySelectorAll('.fields')) {
    const fields = [...grid.children].filter(el => el.matches('.field') && el.getClientRects().length);
    const rows = new Map();
    for (const field of fields) {
      const control = field.querySelector(':scope > input, :scope > select, :scope > .numeric');
      if (!control || !control.getClientRects().length) continue;
      const fieldRect = field.getBoundingClientRect();
      const rowKey = Math.round(fieldRect.top / 4) * 4;
      const controls = rows.get(rowKey) ?? [];
      controls.push({ top: control.getBoundingClientRect().top, label: field.textContent.trim().slice(0, 55) });
      rows.set(rowKey, controls);
    }
    for (const controls of rows.values()) {
      if (controls.length < 2) continue;
      const tops = controls.map(control => control.top);
      if (Math.max(...tops) - Math.min(...tops) > 3)
        failures.push('fields in the same row have misaligned controls: ' + JSON.stringify(controls));
    }
  }
  return failures;
};
// Detect defects that don't trigger axe: narrow-screen overflow, clipped controls,
// invisible images, unusable click targets and off-screen HTML text elements.
const visualGeometry = () => {
  const problems = [];
  const viewport = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > viewport + 2) {
    const offenders = [...document.querySelectorAll('body *')].filter(element => {
      const style = getComputedStyle(element);
      if (style.position === 'fixed' || style.visibility === 'hidden') return false;
      const r = element.getBoundingClientRect();
      return r.width > 0 && (r.right > viewport + 2 || r.left < -2);
    }).slice(0, 5).map(el=>el.tagName.toLowerCase()+(el.className && typeof el.className==='string' ? '.'+el.className.trim().split(/\\s+/).slice(0,2).join('.') : ''));
    problems.push('horizontal overflow: ' + document.documentElement.scrollWidth + 'px vs ' + viewport + 'px; nodes: ' + offenders.join(', '));
  }
  for (const img of document.querySelectorAll('main img, header img, footer img')) {
    if (!img.complete || !img.naturalWidth) problems.push('image failed to load: ' + img.currentSrc);
  }
  for (const el of document.querySelectorAll('.field input:not([type=hidden]),.field select,.actions button,.hero-actions a,.site-nav a')) {
    if (!el.getClientRects().length) continue;
    const b = el.getBoundingClientRect();
    if (b.left < -2 || b.right > viewport + 2) problems.push('control outside viewport: ' + el.outerHTML.slice(0, 130));
    if ((el.matches('button,a') && (b.width < 24 || b.height < 24)) || (el.matches('input,select') && b.height < 40)) {
      problems.push('too-small control: ' + el.outerHTML.slice(0, 130));
    }
  }
  return problems.slice(0, 15);
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
          if (colorScheme === 'light' || width === 320 || width === 1440) await capture(prefix);
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
          const visualIssues = await page.evaluate(visualGeometry);
          if (visualIssues.length) throw new Error('Visual layout: ' + visualIssues.join('; '));
          // Validate the actual generated social images and icons from the local build.
          const assetHrefs = await page.locator('head link[rel="icon"], head link[rel="apple-touch-icon"], head meta[property="og:image"]').evaluateAll(els =>
            els.map(el => el.getAttribute('href') || el.getAttribute('content')).filter(Boolean));
          if (colorScheme === 'light' && width === 390) for (const href of assetHrefs) {
            const pathname = new URL(href, origin).pathname;
            if (inspectedAssets.has(pathname)) continue;
            const response = await page.request.get(new URL(pathname, origin).href);
            if (response.status() !== 200) throw new Error('Missing image/icon asset: ' + pathname + ' returned ' + response.status());
            const mime = response.headers()['content-type'] || '';
            if (!/^image\/(png|svg\+xml)/.test(mime)) throw new Error('Incorrect image MIME on ' + pathname + ': ' + mime);
            const bytes = await response.body();
            if (bytes.byteLength < 250) throw new Error('Incomplete image/icon: ' + pathname);
            inspectedAssets.add(pathname);
            report.assets.push({pathname, mime, bytes: bytes.byteLength});
            if (pathname.startsWith('/og/') && pathname.endsWith('.png')) {
              const filename = 'social-' + pathname.split('/').at(-1);
              await writeFile(join(reportDir, filename), bytes);
              report.screenshots.push(filename);
            }
          }
          const verticalIssues = await page.evaluate(fieldRowAlignment);
          if (verticalIssues.length) throw new Error('Vertical field alignment: ' + verticalIssues.join('; '));
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
            // Also verify fields rendered in the income and goals steps.
            for (const stepName of [/Income and household/, /Goals/]) {
              await page.getByRole('button', { name: stepName }).click();
              const alignmentIssues = await page.evaluate(fieldRowAlignment);
              if (alignmentIssues.length) throw new Error('Wizard step vertical alignment: ' + alignmentIssues.join('; '));
            }
            await page.getByRole('button', { name: /Loans/ }).click();
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
console.log('Audited ' + report.urls.length + ' routes at ' + widths.join('/') + 'px in light/dark; captured ' + report.screenshots.length + ' screenshots; validated ' + report.assets.length + ' image/icon assets; ' + highImpact.length + ' serious/critical axe findings; ' + report.failures.length + ' audit errors.');
for (const message of new Set(report.failures.map(failure => failure.message))) console.error(message);
for (const id of new Set(highImpact.map(issue => issue.id))) console.error('Accessibility finding: ' + id);
// Print a short, actionable sample of offending selectors in CI; the full report is saved to browser.json.
const examples = new Set(report.pages.flatMap(page => page.violations
  .filter(issue => ['serious','critical'].includes(issue.impact))
  .flatMap(issue => issue.targets.slice(0,5).map(target => issue.id + ': ' + target.join(' > ')))));
for (const target of [...examples].slice(0,25)) console.error('Failing element: ' + target);
if (report.failures.length || highImpact.length) process.exitCode = 1;
