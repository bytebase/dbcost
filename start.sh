#!/bin/sh

# For now, we use this script to fetch the data

# example usages:
# ./start.sh, this is how we seed our data, the api key is stored as a env variable
# ./start.sh ${GCP_API_KEY}

echo "Seeding data"

go run ./main/main.go

if [$? -eq 1]; then
    echo "Seeding data failed"
    exit 1
fi

echo "Building frontend"

cd ./frontend && pnpm i && pnpm build
