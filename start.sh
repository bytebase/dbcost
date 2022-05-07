#!/bin/sh

# For now, we use this script to fetch the data

# example usages:
# ./start.sh, this is how we seed our data, the api key is stored as a env variable
# ./start.sh ${GCP_API_KEY}

echo "Seeding Data"

if [ $1 ]; then
    go run ./main/main.go $1
else
    go run ./main/main.go $API_KEY_GCP
fi

echo "Building frontend"

cd ./frontend && pnpm i && pnpm build
