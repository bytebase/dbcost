#!/bin/sh

# For now, we use this script to start our service on render

# example usages:
# ./render.sh

echo "Building frontend"

# nuxt3 requries vue3/vue-router, pnpm i --shamefully-hoist would move this tow dependencies to the top level,
# so that we can directly use this two packages in our code.
cd ./frontend && pnpm i --shamefully-hoist && pnpm generate
