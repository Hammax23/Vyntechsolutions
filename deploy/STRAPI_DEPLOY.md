# Deploy Strapi CMS on VPS (alongside existing Next.js on 3005)

## Safety

- Do NOT delete other PM2 apps or DBs
- New process name: `vyntech-strapi`
- New port: **1338**
- New Postgres container: `vyntech_strapi_db` (host port 5437)

## Steps

```bash
cd /var/www/vyntech   # or your project path

git pull origin master

# Start Strapi DB (if using repo docker-compose)
docker compose up -d strapi_db

cd cms
cp .env.example .env   # or create .env — set DATABASE_PORT=5437, PORT=1338
# Edit APP_KEYS / secrets for production
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
```

## Nginx

Copy `deploy/nginx-strapi.conf` to sites-available, symlink, reload:

```bash
ln -sf /etc/nginx/sites-available/nginx-strapi.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d cms.vyntechsolutions.ca
```

## Next.js production env

Add to `/var/www/vyntech/.env`:

```
STRAPI_URL=https://cms.vyntechsolutions.ca
NEXT_PUBLIC_STRAPI_URL=https://cms.vyntechsolutions.ca
STRAPI_API_TOKEN=<read-only-token-from-strapi-admin>
```

Then:

```bash
cd /var/www/vyntech
npm run build
pm2 restart vyntechsolutions
```

## First admin

Open `https://cms.vyntechsolutions.ca/admin` and create the SEO expert admin account.
Editor role should have CRUD on content types (configure in Settings → Roles).
