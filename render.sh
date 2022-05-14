#!/bin/sh

# For now, we use this script to start our service on render

# example usages:
# ./render.sh     this is how we seed our data, the api key is stored as a env variable on render

echo "Seeding data"

go run ./seed/main.go

if [ $? -eq 1 ]; then
    echo "Seeding data failed"
    exit 1
fi

echo "Building frontend"

cd ./frontend && pnpm i && pnpm build
