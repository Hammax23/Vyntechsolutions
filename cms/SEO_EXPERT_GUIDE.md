# SEO Expert Guide — Strapi CMS (VynTech Solutions)

Strapi is your full editorial CMS. After changes, click **Publish** (Draft & Publish). The Next.js site reads published content only.

**Admin:** `http://localhost:1337/admin` (local) or `https://cms.vyntechsolutions.ca/admin` (production)

---

## What you can edit (complete checklist)

| Your task | Strapi content type | Shows on |
|-----------|---------------------|----------|
| Site-wide title / description / phone / email | **Global SEO** | Default meta, schema fallbacks |
| Per-URL meta title, description, H1, noindex | **Page SEO** | That path’s `<title>` / meta |
| Homepage hero slides (text + media URL) | **Homepage** → Hero Slides | Hero section |
| Homepage section headings (services, insights, partners…) | **Homepage** | Home sections |
| Nav primary links (Blog, About, Careers…) | **Navigation** → Primary Links | Header |
| Footer legal + social URLs | **Navigation** → Legal / Social Links | Footer bottom + social icons |
| Service titles, copy, features, SEO | **Service** | `/services`, mega menu, footer, detail pages |
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
3. Slug controls the URL (`/services/your-slug`) — change carefully.
4. **Publish**. Navbar, footer, and list pages update automatically.

### 3. Homepage hero copy
1. Open **Homepage**.
2. Edit **Hero Slides**: `heading` (use `\n` for line break), `subtext`, optional `mediaUrl` + `mediaType`.
3. Edit `servicesHeading` / `servicesSubheading` / `servicesBody` for the Our Services block.
4. **Publish**.

### 4. Blog article
1. Create/edit **Blog Post**, set category, excerpt, content, meta.
2. Mark **featured** if it should highlight on home insights.
3. **Publish**.

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
   - Create / Read / Update / Publish / Delete on all content types above
   - Media library upload
   - **No** access to Settings / Users-Permissions / API Tokens (keep admin-only)

---

## Rules

- Always **Publish** after saving drafts.
- Prefer editing existing entries over recreating (keeds IDs/slugs stable).
- Do not delete Global SEO, Navigation, Homepage, or Form Config single types.
- CRM (`/admin`) and SEO ops panel (`/seopanel`) stay outside Strapi (quotes, keywords, backlinks).

---

## If content does not appear on the live site

1. Confirm entry is **Published**.
2. Confirm Strapi is running and Next.js `STRAPI_URL` points to it.
3. Hard-refresh the page (CDN/cache may take a moment in production).
4. Ask a developer only for layout/CSS/template changes — not for editorial text.
