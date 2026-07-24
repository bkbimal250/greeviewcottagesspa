# Production media storage

This project stores uploaded property and cottage media on the VPS filesystem.
AWS S3 is not required.

## Django environment

Use these values in production:

```env
MEDIA_URL=/media/
MEDIA_ROOT=/var/www/greeviewcottagesspa/media
```

## Folder setup

Run this on the VPS after deployment:

```bash
sudo mkdir -p /var/www/greeviewcottagesspa/media
sudo chown -R www-data:www-data /var/www/greeviewcottagesspa/media
sudo find /var/www/greeviewcottagesspa/media -type d -exec chmod 750 {} \;
sudo find /var/www/greeviewcottagesspa/media -type f -exec chmod 640 {} \;
```

Uploads are organized under:

```text
media/
  properties/
    <property-id>/
      cover/
      thumbnail/
      gallery/
      exterior/
      garden/
      reception/
      common-area/
      cottages/
        <cottage-id>/
          cover/
          thumbnail/
          bed/
          bathroom/
          interior/
          exterior/
          gallery/
```

## Nginx

Add this block to the production API server block, next to `/static/`:

```nginx
location /media/ {
    alias /var/www/greeviewcottagesspa/media/;
    expires 30d;
    add_header Cache-Control "public";
    access_log off;

    location ~* \.(php|php\d+|phtml|pl|py|jsp|asp|sh|cgi)$ {
        deny all;
    }
}
```

Then reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```
