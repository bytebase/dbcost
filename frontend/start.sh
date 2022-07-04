#!/bin/sh

# We use this script to start Nuxt.

# example usages:
# ./start.sh dev :start the frontend with dev mode
# ./start.sh sample :start the frontend with sample mode

touch .env && echo NUXT_PUBLIC_MODE=$1 >>.env
nuxt dev
