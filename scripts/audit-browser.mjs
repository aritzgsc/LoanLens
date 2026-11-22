import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [origin = 'http://localhost:4321', output = 'audit-artifacts', dist = 'dist'] = process.argv.slice(2);
const reportDir = resolve(output);
const widths = [320, 390, 768, 1024, 1440];
const heights = { 320: 740, 390: 844, 768: 1024, 1024: 768, 1440: 900 };
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
  // Astro's client:load islands may hydrate just after the initial load event.
  // Do not trigger interaction smoke-tests before the framework has wired events.
  await page.waitForFunction(() => [...document.querySelectorAll('astro-island')]
    .every(island => !island.hasAttribute('ssr')), null, {timeout:10000});
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
          if (route === '/') {
            const menu = page.locator('[data-mobile-nav]');
            if (width <= 720) {
              if (!(await menu.isVisible()) || await page.locator('.site-nav').isVisible())
                throw new Error('Compact navigation is not active on small screens');
              await menu.locator('summary').click();
              await menu.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Guides',exact:true}).waitFor();
              if (await menu.locator('a:visible').count() < 5)
                throw new Error('Mobile navigation is missing destinations');
              await menu.locator('summary').press('Escape');
              if (await menu.evaluate(element=>element.open))
                throw new Error('Escape did not dismiss the mobile navigation');
            } else if (await menu.isVisible()) {
              throw new Error('Mobile navigation should be hidden at desktop widths');
            }
          }
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
            if (width<=390) {
              const chartInfo=await page.locator('.chart-scroll').first().evaluate(el=>({
                viewport:el.clientWidth,content:el.scrollWidth
              }));
              if (chartInfo.content <= chartInfo.viewport+20)
                throw new Error('Loan chart is not horizontally explorable on phones');
            }
            const resultsAxe = await new AxeBuilder({ page }).analyze();
            report.pages.push({ route, width, colorScheme, state: 'example', ...await page.evaluate(textMetrics),
              violations: resultsAxe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) })),
            });
            // Exercise the actual add/remove controls, rather than only static screenshots.
            await page.getByRole('button', { name: /Add another loan/ }).click();
            await page.getByRole('group', { name: 'Loan 2' }).waitFor();
            const loanStepIssues = await page.evaluate(fieldRowAlignment);
            if (loanStepIssues.length) throw new Error('Multiple-loan fields: ' + loanStepIssues.join('; '));
            if (colorScheme === 'light' && [320, 390, 1440].includes(width)) await capture(prefix + '-two-loans');
            await page.getByRole('button', { name: /Remove loan 2/ }).click();
            await page.getByRole('group', { name: 'Loan 2' }).waitFor({ state: 'detached' });
            await page.getByRole('button', { name: /Income and household/ }).click();
            await page.getByLabel('Tax filing status').selectOption('joint');
            await page.getByText('Spouse’s share of joint AGI').waitFor();
            if (colorScheme === 'light' && [320, 390, 1440].includes(width)) await capture(prefix + '-joint-income');
            await page.getByRole('button', { name: /Goals/ }).click();
            await page.getByLabel(/I expect to keep working/).check();
            await page.getByText('Certified PSLF payments shared by these loans').waitFor();
            if (colorScheme === 'light' && [320, 390, 1440].includes(width)) await capture(prefix + '-pslf-goals');
            await page.getByRole('button', { name: /Loans/ }).click();
            await page.getByRole('button', { name: 'Reset', exact: true }).press('Enter');
            await page.getByText('Example borrower loaded.', { exact: true }).waitFor({ state: 'hidden' });
            if (colorScheme==='light' && width===390) {
              const rate=page.getByRole('group',{name:'Loan 1'}).getByRole('textbox',{name:'Annual interest rate'});
              await rate.fill('101');
              await page.getByRole('button',{name:'Continue'}).click();
              if (await rate.getAttribute('aria-invalid')!=='true' || !(await rate.evaluate(el=>el===document.activeElement)))
                throw new Error('Invalid calculator input did not regain focus');
              await page.getByRole('button',{name:'Reset',exact:true}).click();
            }
          }
          if (route === '/tools/compare-college-aid-offers/') {
            const cost = page.getByRole('group', { name: 'School A', exact: true })
              .getByRole('textbox', { name: 'Annual cost of attendance (USD)' });
            await page.getByRole('button', { name: 'Use example offers' }).press('Enter');
            await page.getByRole('region', { name: 'School A', exact: true })
              .getByText('$12,500.00', { exact: true }).waitFor();
            await page.getByRole('region', { name: 'School B', exact: true })
              .getByText('$13,000.00', { exact: true }).waitFor();
            if (await page.locator('.aid-field-hint').count() !== 8) throw new Error('College aid input explanations are missing');
            await page.getByRole('heading',{name:'The differences that matter'}).waitFor();
            const insights=page.locator('.aid-insight');
            if (await insights.count() !== 3) throw new Error('Missing aid comparison insights');
            if (!(await page.locator('.aid-insights').innerText()).includes('$1,000.00')) throw new Error('Expected $1,000 net price difference');
            await capture(prefix + '-example');
            const resultsAxe = await new AxeBuilder({ page }).analyze();
            report.pages.push({ route, width, colorScheme, state: 'example', ...await page.evaluate(textMetrics),
              violations: resultsAxe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) })),
            });
            // Optional school names must stay attached to their offers when swapping.
            await page.locator('#aid-school-name-0').fill('North Valley University');
            await page.getByRole('heading',{name:'North Valley University'}).waitFor();
            await page.getByRole('button',{name:'Swap schools'}).click();
            if (await page.locator('#aid-school-name-1').inputValue() !== 'North Valley University')
              throw new Error('Swapping offers did not preserve school names');
            await page.getByRole('button',{name:'Compare offers'}).click();
            await page.getByRole('heading',{name:'North Valley University'}).waitFor();
            // View responsive feedback/error state and validate semantic focus.
            if (colorScheme === 'light' && [320, 390, 1440].includes(width)) {
              await cost.fill('-40');
              await page.getByRole('button', { name: 'Compare offers' }).click();
              await page.getByRole('alert').waitFor();
              await capture(prefix + '-validation');
              await cost.fill('30,000');
            }
            await cost.fill('-40');
            await page.getByRole('button', { name: 'Compare offers' }).press('Enter');
            await page.getByRole('alert').getByText('Check the highlighted amounts before comparing.').waitFor();
            await page.locator('#aid-0-cost:focus[aria-invalid="true"]').waitFor();
            await page.getByRole('button', { name: 'Reset', exact: true }).press('Enter');
            if (await cost.inputValue() !== '') throw new Error('Aid comparison reset did not clear the cost field');
            await page.getByText('Compare two offers to see what you may have left to cover.').waitFor();
          }
          // Exercise every independent interactive tool and capture meaningful state.
          if (route === '/deadlines/') {
            await page.getByLabel('Notice date').fill('2026-11-05');
            await page.getByText(/Estimated deadline/).waitFor();
            await page.getByLabel('Current plan or situation').selectOption('paye');
            await page.getByText(/Choose an eligible replacement/).waitFor();
            if (colorScheme === 'light' && [320, 1440].includes(width)) await capture(prefix + '-plan-changed');
          }
          if (route === '/tools/married-rap-impact/') {
            const income = page.getByLabel('Your adjusted gross income');
            await income.focus();
            await income.press('Tab');
            if (await income.inputValue() !== '$45,000')
              throw new Error('Untouched currency field did not restore its formatted value');
            await income.fill('56000');
            const beforeBlur = await income.inputValue();
            const beforeNotice = await page.locator('.notice').first().innerText();
            await income.press('Tab');
            const formattedIncome = await income.inputValue();
            const afterNotice = await page.locator('.notice').first().innerText();
            if (Number(formattedIncome.replace(/[^0-9.]/g, '')) !== 56000)
              throw new Error('Edited income did not retain $56,000; beforeBlur=' + beforeBlur +
                ' afterBlur=' + formattedIncome + ' beforeNotice=' + beforeNotice.slice(0,130) +
                ' afterNotice=' + afterNotice.slice(0,130));
            const issues = await page.evaluate(fieldRowAlignment);
            if (issues.length) throw new Error('Married RAP: ' + issues.join('; '));
            if (colorScheme === 'light' && [320, 390, 1440].includes(width)) await capture(prefix + '-edited');
          }
          if (route === '/tools/parent-plus-consolidation-checker/') {
            await page.getByLabel(/When was your Parent PLUS consolidation loan disbursed/).selectOption('before');
            await page.getByLabel(/Made an ICR payment/).selectOption('yes');
            await page.getByText(/Ask your servicer to confirm/).waitFor();
            if (colorScheme === 'light' && [320, 1440].includes(width)) await capture(prefix + '-eligible-path');
          }
          if (route === '/tools/pslf-payment-tracker/') {
            const certified = page.getByLabel(/Certified qualifying payments for one loan/);
            await certified.fill('120');
            await certified.press('Tab');
            await page.getByText(/Payment count reached/).waitFor();
            if (colorScheme === 'light' && [320, 1440].includes(width)) await capture(prefix + '-completed');
          }
          if (route === '/rap-payment-by-income/') {
            const dependents = page.getByLabel(/Dependents claimed on your return/);
            await dependents.fill('2');
            await dependents.press('Tab');
            if (await page.getByRole('table').count() !== 1) throw new Error('RAP table is not present');
            if (colorScheme === 'light' && [320, 1440].includes(width)) await capture(prefix + '-dependents');
          }
          if (['/about/','/contact/','/privacy/','/sources/','/editorial-policy/',
               '/advertising/','/disclaimer/','/terms/','/accessibility/'].includes(route)) {
            const article=page.locator('.trust-article');
            const navigation=page.getByRole('navigation',{name:'Useful policies and information'});
            if (route==='/contact/' && await page.locator('.contact-option').count()!==3)
              throw new Error('Contact page reporting options are missing');
            if (await article.count()!==1 || await navigation.count()!==1)
              throw new Error('Missing compact trust page layout');
            if (!(await navigation.isVisible()))
              throw new Error('Compact trust sidebar is hidden');
            if (await article.locator('h2').count() < 1)
              throw new Error('Trust page needs readable, structured sections');
            const point=page.locator('.trust-key-point');
            if (!await point.isVisible()) throw new Error('Trust summary missing');
            if (await page.locator('.trust-next-grid a').count()!==3)
              throw new Error('Trust next-step navigation is missing');
            const layoutIssue=await page.evaluate(() => {
              const frame=document.querySelector('.trust-page');
              const hero=document.querySelector('.trust-hero');
              const cols=document.querySelector('.trust-columns');
              const main=document.querySelector('main');
              if (!frame||!hero||!cols||!main) return 'Missing editorial layout';
              const a=frame.getBoundingClientRect(),h=hero.getBoundingClientRect(),c=cols.getBoundingClientRect(),m=main.getBoundingClientRect();
              if (Math.abs((a.left+a.right)/2-(m.left+m.right)/2)>4) return 'Information page is not centered';
              if (Math.abs((h.left+h.right)/2-(a.left+a.right)/2)>4) return 'Information hero is not centered';
              if (Math.abs((c.left+c.right)/2-(a.left+a.right)/2)>4) return 'Article columns are not centered';
              if (a.left < -1 || a.right > window.innerWidth+1) return 'Information page overflows screen';
              return '';
            });
            if (layoutIssue) throw new Error(layoutIssue);
            if (await page.locator('.site-footer .footer-menu').count()!==3)
              throw new Error('Grouped footer links are missing');
          }
          if (route === '/guides/faq/') {
            if (await page.locator('.article-body h2').count() < 6)
              throw new Error('Loan calculator FAQ lacks useful Q&A sections');
            if (!await page.getByRole('link',{name:/loan simulator|repayment calculator/i}).count() &&
                !await page.locator('.article-body a[href="/calculator/"]').count())
              throw new Error('FAQ missing useful calculator cross-links');
          }
          if (route === '/tools/' || route === '/guides/') {
            const finder=page.locator('[data-goal-finder]');
            if (await finder.locator('[data-goal-panel]:visible').count() !== 1) throw new Error('Intent picker must have exactly one visible result');
            await finder.getByRole('button',{name:'I want to know what I might pay'}).click();
            await finder.getByRole('heading',{name:'Explore monthly payments and total cost'}).waitFor();
            const expectedPrimary=route==='/tools/'?'/calculator/':'/guides/compare-student-loan-repayment/';
            const actualPrimary=await finder.locator('[data-goal-panel]:visible a.primary').getAttribute('href');
            if (actualPrimary !== expectedPrimary) throw new Error('Incorrect primary destination for payment goal: '+actualPrimary);
            await finder.locator('.goal-more summary').click();
            const pslfChoice=finder.getByRole('button',{name:'I work in public service and track PSLF'});
            await pslfChoice.focus();
            await pslfChoice.press('Enter');
            await finder.getByRole('heading',{name:'Estimate how many qualifying payment periods may remain'}).waitFor();
            if (await pslfChoice.getAttribute('aria-pressed')!=='true' ||
                await finder.locator('[data-goal-panel]:visible').count()!==1)
              throw new Error('Intent picker keyboard selection or hidden panels are incorrect');
            if (colorScheme==='light' && [320,390,1440].includes(width)) await capture(prefix+'-goal-picked');
            const search=page.locator('[data-resource-search]');
            await search.fill('pslf');
            const visibleCards=page.locator('[data-resource-card]:visible');
            if (await visibleCards.count() !== 1) throw new Error('Resource search did not narrow to one PSLF item on '+route);
            await search.fill('nothing-matches-this-test');
            await page.getByText('No matching resources.').waitFor();
            if (await page.locator('.resource-filter-count').count() !== await page.locator('.resource-filter').count())
              throw new Error('Directory topic counts are missing');
            await page.getByRole('button',{name:'Clear search'}).click();
            if (await search.inputValue() !== '') throw new Error('Quick search clear did not reset the query');
            await search.fill('nothing-matches-this-test');
            await page.getByRole('button',{name:'Clear filters'}).click();
            if (await search.inputValue() !== '') throw new Error('Resource clear did not reset search input');
            const matching=await visibleCards.count();
            if (matching < (route === '/guides/' ? 6 : 7)) throw new Error('Not all directory cards visible after clear: '+matching);
            const selected=route==='/guides/'?'Choosing a college':'Before college';
            await page.getByRole('button',{name:selected,exact:true}).click();
            const topicCount=await visibleCards.count();
            if (topicCount !== (route==='/guides/'?2:1)) throw new Error('Topic filter returned incorrect count: '+topicCount);
            await page.getByRole('button',{name:'All topics'}).click();
            if (colorScheme==='light' && [320,390,1440].includes(width)) await capture(prefix+'-directory');
          }
          if (['/deadlines/','/tools/married-rap-impact/','/tools/parent-plus-consolidation-checker/','/tools/pslf-payment-tracker/','/rap-payment-by-income/'].includes(route)) {
            const help=page.locator('.tool-plain-help');
            await help.locator('summary').click();
            if (!(await help.evaluate(element=>element.open))) throw new Error('Plain-language tool help did not expand');
            if (!(await help.innerText()).includes('Try it:')) throw new Error('Tool example is missing');
          }
          if (route === '/guides/student-loan-interest-explained/') {
            const nav=page.getByRole('navigation',{name:'On this page'});
            await nav.getByRole('link').first().click();
            if (!new URL(page.url()).hash) throw new Error('Article on-page contents did not navigate to a heading');
          }
          if (route === '/') {
            const item = page.locator('.home-question-list details').first();
            await item.locator('summary').click();
            if (!(await item.evaluate(el => el.open))) throw new Error('Homepage question did not expand');
            if (colorScheme === 'light' && [320, 1440].includes(width)) await capture(prefix + '-faq-expanded');
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
