# VynTech Strapi CMS

Headless CMS for VynTech Solutions (Next.js frontend stays in repo root).

## Local setup

1. Start Strapi Postgres (port **5437**):

```bash
docker compose up -d strapi_db
```

2. Install & run CMS:

```bash
cd cms
npm install
npm run develop
```

3. Open Admin: http://localhost:1337/admin  
   Create first admin user on first launch.

4. Content auto-seeds from `cms/data/seed.json` when collections are empty.
5. SEO / editorial workflow: see `SEO_EXPERT_GUIDE.md` — everything site-facing copy/SEO is editable in Strapi.

## Next.js env (repo root `.env`)

```
STRAPI_URL=http://127.0.0.1:1337
NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337
STRAPI_API_TOKEN=   # optional Full-access / Read-only token from Strapi Settings → API Tokens
```

## Content types

**Phase A:** Global SEO, Page SEO, FAQ, Service, Industry, Blog Post, Blog Category  
**Phase B:** Homepage, Static Page, Legal Page, Navigation, Promo, Form Config, Job Opening, Organization Profile, Client Logo

## Production (VPS)

- DB: Docker `vyntech_strapi_db` on 5437 (or remote Postgres)
- App: PM2 `cms/ecosystem.config.js` → `vyntech-strapi` on port **1338**
- Nginx: [`deploy/nginx-strapi.conf`](../deploy/nginx-strapi.conf) → `cms.vyntechsolutions.ca`
- Set production `STRAPI_URL=https://cms.vyntechsolutions.ca` on Next.js and rebuild

```bash
cd /var/www/vyntech/cms
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
```
