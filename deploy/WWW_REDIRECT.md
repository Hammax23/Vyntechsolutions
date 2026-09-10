# www / non-www duplicate URL fix

**Preferred host:** `https://vyntechsolutions.ca` (non-www)  
**Action:** 301 redirect all `www` traffic to non-www at nginx (not JS).

## VPS steps

```bash
cd /var/www/vyntech
git pull origin master

# Backup current nginx site config
cp /etc/nginx/sites-available/vyntechsolutions /etc/nginx/sites-available/vyntechsolutions.bak.$(date +%F)

# Install updated config from repo
cp deploy/nginx-vyntech.conf /etc/nginx/sites-available/vyntechsolutions

# If cert paths differ, edit the two ssl_certificate lines to match:
#   ls /etc/letsencrypt/live/
# Ensure cert covers both names:
#   certbot certificates
# If www is missing from cert:
#   certbot --nginx -d vyntechsolutions.ca -d www.vyntechsolutions.ca --expand

nginx -t && systemctl reload nginx

# Redeploy Next (host-based redirects in next.config.mjs)
npm run build
pm2 restart vyntechsolutions
```

## Verify (must be HTTP 301)

```bash
curl -I https://www.vyntechsolutions.ca/
# Expect: HTTP/2 301
# Expect: location: https://vyntechsolutions.ca/

curl -I https://www.vyntechsolutions.ca/services
# Expect: location: https://vyntechsolutions.ca/services
```

## Google Search Console (manual)

1. Confirm property for `https://vyntechsolutions.ca`
2. Resubmit sitemap: `https://vyntechsolutions.ca/sitemap.xml`
3. Use URL Inspection on a former www URL to confirm redirect

Canonical tags already use non-www (`SITE_URL` / metadata helpers strip `www`).
