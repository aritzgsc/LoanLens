# LoanLens visual language — v6

**Purpose:** make every public route feel like the same product while preserving the different jobs of the homepage, calculator, Guides and Tools.

## Canonical implementation

- Base font: DM Sans Variable. Light-first colors use `--ll-page-*` tokens in `src/styles/ui-system.css`.
- Shared hero contract: every main public H1 appears within `.page-hero`, with consistent light-green-to-white surface, 1 px soft border, 20 px radius (16 px on phones), shared left alignment and `--ll-page-h1` typography.
- The homepage alone uses a **two-column hero**, because its chooser is a real interaction; it is not a new palette or typographic system.
- Introductory page labels use `.page-hero-kicker` and the same upper-case 12 px-scale lettering. Trust/info pages and Guides use the same hierarchy and metadata rhythm.
- All card families use the shared surface, shadow, border and 16 px radius: directory cards, tool explanation cards, guide links, contact cards and home cards.
- Specialized calculators retain data-related affordances such as input validation, accent-colored result cards and scrollable charts.
- Information pages use the same page-hero treatment but retain narrower copy widths for readability; their sidebar is supplementary and does not create a different visual theme.
- Shared section spacing uses `--ll-page-section-gap`; H2 and body introduction scales share tokens.
- Breakpoints: <= 1024 px: homepage hero stacks. <= 650 px: common compact hero size and stacked cards. Preserve existing mobile navigation at <= 720 px, form field grids and accessible targets.
- Keep warnings and disclosure text prominent: harmonization must not hide limitations, estimates, taxes or official source links.

## Routes sharing the system

1. Homepage and calculator (standalone and embedded).
2. Tools/Guides directories.
3. The five specialized tool routes (SAVE deadline, RAP income, married RAP, Parent PLUS, PSLF).
4. All guides, FAQ, glossary and financial educational pages.
5. About, Contact, Editorial Policy, Sources, Disclaimer, Privacy, Terms, Accessibility and Advertising.
6. 404 not-found page.

## Regression guarantees

The Chrome/axe suite now checks that every route includes a visible shared hero with a normal inset, background gradient, solid border, left alignment, consistent headline scale and radius, at 320, 375, 390, 768, 1024, 1440, 1920 px in both OS theme preferences. It also captures the full page and first fold for visual review and checks layout overflow, contrast and focus behavior.

### Manual spot-check

Compare Home, Calculator, Tools, Guides, a specialty tool, a guide with a table, and About at phone and desktop sizes. Check typography, amount of whitespace, sidebar behavior, keyboard focus, open menus, long headings and detailed result states. Use screenshots as evidence; a green CI check does not guarantee subjective aesthetic perfection.

## Avoiding future drift

If a page needs a different design, use a semantic **variant of existing tokens** instead of introducing another unscoped hero/card style. Do not append a new color palette to site.css. New page templates must use `.page-hero` plus the shared section/card spacing.
