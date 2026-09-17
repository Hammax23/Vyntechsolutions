# SEO Expert Guide — Strapi CMS (VynTech Solutions)

Strapi is your full editorial CMS. After changes, click **Publish** (Draft & Publish). The Next.js site reads published content only.

**Admin:** `http://localhost:1337/admin` (local) or `https://cms.vyntechsolutions.ca/admin` (production)

---

## What you can edit (complete checklist)

| Your task | Strapi content type | Shows on |
|-----------|---------------------|----------|
| Site-wide title / description / phone / email | **Global SEO** | Default meta, schema fallbacks |
| `robots.txt` body | **Global SEO** → `robotsTxt` | `/robots.txt` (SEO Expert template; Allow `/_next/static` + `/_next/image`) |
| Per-URL meta title, description, H1, noindex | **Page SEO** | That path’s `<title>` / meta |
| Homepage hero slides (text + media URL) | **Homepage** → Hero Slides | Hero section |
| Homepage section headings (services, insights, partners…) | **Homepage** | Home sections |
| Nav primary links (Blog, About, Careers…) | **Navigation** → Primary Links | Header |
| Footer legal + social URLs | **Navigation** → Legal / Social Links | Footer bottom + social icons |
| Service titles, copy, features, SEO | **Service** | `/services`, mega menu, footer, detail pages |
| Service H1 (`subtitle`) + overview H2 (`overviewHeading`) | **Service** | Service detail hero + overview (must differ) |
| Industry titles, copy, SEO | **Industry** | `/industries`, mega menu, footer, detail pages |
| Blog posts + categories | **Blog Post** / **Blog Category** | Blog listing + posts |
| FAQs (JSON-LD + Q&A) | **FAQ** | Structured data / FAQ surfaces |
| About hero + mission copy | **Static Page** (`about`) | `/about` |
| Privacy / Terms body HTML | **Legal Page** | `/privacy-policy`, `/terms-and-conditions` |
| Contact form options (services, regions, budget, hear-about) | **Form Config** | Let’s Talk forms |
| Client / partner names or logo URLs | **Client Logo** | Logo carousel |
| Promo bars / ranking CTA / popup copy | **Promo** (by slot) | Announcement, Google Ranking, timed CTA |
| Careers job listings | **Job Opening** | Careers page |
| Organization schema (name, geo, rating) | **Organization Profile** | JSON-LD |

---

## Typical SEO workflows

### 1. Change a page’s Google title / description
1. Open **Page SEO** (or create one with path like `/services` or `/about`).
2. Edit `seo.metaTitle`, `seo.metaDescription`, `h1`.
3. Set `indexable` to false only if you must noindex.
4. **Publish**.

### 2. Update a service or industry landing page
1. Open **Service** or **Industry**.
2. Edit title, description, features, SEO component.
3. **Service headings (avoid duplicate H1/H2):**
   - `subtitle` → page **H1** (hero headline)
   - `overviewHeading` → overview section **H2** (must be different from subtitle)
   - `overview` → body under that H2
   - `featuresEyebrow` → “What We Offer” label above feature cards
4. Slug controls the URL (`/services/your-slug`) — change carefully.
5. **Publish**. Navbar, footer, and list pages update automatically.

### 3. Homepage (every section editable)
Open **01. Homepage** (single type). Map:

| Section on site | Strapi fields |
|-----------------|---------------|
| Hero text / CTA / bottom words | `heroSlides` (heading, subtext, cta), `heroCtaLabel`, `heroWords` |
| Hero backgrounds | Code-static videos (not CMS) — intentional |
| Client logos strip | `partnersHeading`, `partnersShowHeading` + **Client Logo** entries |
| Our Services | `servicesHeading`, `servicesSubheading`, `servicesBody`, `servicesLearnMoreLabel`, `serviceCards` |
| SEO ranking card | **07. Promos** → slot `google-ranking` (`eyebrow`, `heading`, `body`, `ctaLabel`, `ctaHref`) |
| Tech stack | `techStackEyebrow`, `techStackHeading`, `techStackBody`, `techStack` JSON |
| Technology impact | `impactEyebrow`, `impactHeading`, `impactBody`, `impactStats`, `impactCtaLabel`, `impactCtaHref` |
| Industries | `industriesHeading`, `industriesSubheading`, `industriesViewLabel` + **Industry** cards |
| Featured insights | `insightsEyebrow`, `insightsHeading`, `insightsIntro`, `insightsVideoUrl`, `insightsViewAllLabel`, `insightsViewAllHref` + **Blog Post** cards |
| FAQ chrome | `faqEyebrow`, `faqHeading`, `faqIntro` |
| FAQ Q&A | **05. FAQs** with `page` = `home` |
| Nav / footer | **Navigation** (site-wide) |
| SEO meta | Homepage `seo` component |

### 3b. About page
1. Open **08. Static Pages** → slug `about`.
2. Edit `heroHeading`, `heroBody`, optional `body` (full richtext — if set, replaces mission/values/process blocks).
3. Edit `sections` JSON for mission, values, process, CTAs, stats (`missionStats`, `ctaHeading`, `ctaEmail`, …).
4. **Publish**. Impact strip on About uses **Homepage** impact fields.

Open **03. Blog Posts** → Create new entry (or edit existing).

| Field | What to do | Notes |
|-------|------------|--------|
| **Title** | Article title | Becomes page H1 on the site |
| **Slug** | Auto from title — edit carefully | URL = `/blog/your-slug` |
| **Category** | Pick from **04. Blog Categories** | Create category first if missing |
| **Excerpt** | 1–2 sentence teaser | Listing + hero subtext |
| **Content** | Full article body | See formatting below |
| **Tags** | Comma-separated | e.g. `custom software, ROI, startups` |
| **Author** | Byline | Default: VynTech Solutions Team |
| **Read time** | e.g. `5 min` | Shown under author |
| **Image** | Cover image URL | Or upload **Cover** media |
| **Featured** | Toggle on for homepage insights | One featured post recommended |
| **Meta description** | Optional short meta | Prefer filling **SEO** component too |
| **SEO** | `metaTitle` (≤60), `metaDescription` (≤160), focus keyword, OG | Required for Google |

**Always click Publish** after save.

#### Content formatting (H1 / H2 / H3 — no developer needed)

The site accepts **both** styles in **Content**:

**Option A — Markdown (Strapi Rich text editor)**  
Type headings like this (space after `#`):

```text
# Main section (H1) — rare inside body; page title is already H1
## Section title (H2)
### Subsection (H3)
#### Smaller heading (H4)

Paragraph text here.

- Bullet one
- Bullet two

1. Numbered step
2. Next step

**Bold text** and [link text](https://example.com)
```

**Option B — HTML** (paste from docs / export tools):

```html
<h2>Section title</h2>
<p>Paragraph with <strong>bold</strong> and <a href="/services">internal link</a>.</p>
<ul><li>Item</li></ul>
```

Supported: **H1–H6**, paragraphs, bullet/numbered lists, bold/italic, links, blockquotes.  
Do **not** put scripts or iframes in content.

#### New category
1. **04. Blog Categories** → Create → Name + Slug → **Publish**.
2. Attach it on the Blog Post → Category relation.

#### Listing / post chrome (CTA, “Related Articles”, empty states)
Edit **Static Page** → slug `blog` → `heroHeading`, `heroBody`, and `sections` JSON keys  
(`ctaHeading`, `relatedHeading`, `postCtaHeading`, `featuredLabel`, …).

### 5. Legal pages
1. Open **Legal Page** → Privacy or Terms.
2. Edit rich text `body` (HTML is fine).
3. Update `lastUpdated`.
4. **Publish**.

### 6. Form dropdown options
1. Open **Form Config**.
2. Edit JSON arrays: `services` (prefer service **slugs**), `regions`, `hearAbout`, `budgetOptions`.
3. **Publish**.

---

## Role setup (admin once)

1. Create user under **Settings → Users**.
2. Create/assign role **SEO Editor** with:
   - Create / Read / Update / Publish / Delete on all content types above (especially **Blog Post**, **Blog Category**, **Page SEO**, **Service**, **Industry**, **Static Page**)
   - Media library upload
   - **No** access to Settings / Users-Permissions / API Tokens (keep admin-only)
   - Blog posting must not require a developer — Content field supports H1–H6 via Markdown (`##`) or HTML (`<h2>`)

---

## Rules

- Always **Publish** after saving drafts.
- Prefer editing existing entries over recreating (keeds IDs/slugs stable).
- Do not delete Global SEO, Navigation, Homepage, or Form Config single types.
- CRM (`/admin`) stays outside Strapi (quotes, projects, invoices).
- Live SEO is managed **only in Strapi** (Global SEO, Page SEO, and each Service / Industry / Blog SEO component).

---

## If content does not appear on the live site

1. Confirm entry is **Published**.
2. Confirm Strapi is running and Next.js `STRAPI_URL` points to it.
3. Hard-refresh the page (CDN/cache may take a moment in production).
4. Ask a developer only for layout/CSS/template changes — not for editorial text.
