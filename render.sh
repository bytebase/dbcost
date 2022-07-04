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

# nuxt3 requries vue3/vue-router, pnpm i --shamefully-hoist would move this tow dependencies to the top level,
# so that we can directly use this two packages in our code.
cd ./frontend && pnpm i --shamefully-hoist && pnpm generate
