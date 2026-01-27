#!/bin/sh
# Start Spring Boot in background
java -jar /app/backend.jar &

# Start nginx in foreground
nginx -g "daemon off;"

