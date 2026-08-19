#!/bin/sh
set -e

# Wait for the database to accept connections (compose healthchecks / k8s
# readiness usually cover this, but this makes the container resilient on
# its own too, e.g. when restarted independently).
if [ -n "$DB_HOST" ]; then
    echo "Waiting for database at ${DB_HOST}:${DB_PORT:-3306}..."
    for i in $(seq 1 30); do
        if php -r "exit(@fsockopen(getenv('DB_HOST'), getenv('DB_PORT') ?: 3306) ? 0 : 1);"; then
            break
        fi
        sleep 2
    done
fi

php artisan config:cache
php artisan route:cache
php artisan migrate --force

case "$1" in
    worker)
        echo "Starting queue worker..."
        exec php artisan queue:work --tries=3 --sleep=3 --max-time=3600
        ;;
    web|*)
        echo "Starting web server..."
        exec apache2-foreground
        ;;
esac
