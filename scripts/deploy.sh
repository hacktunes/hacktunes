#!/bin/bash

# based on:
# - https://gist.github.com/domenic/ec8b0fc8ab45f39403dd
# - http://www.steveklabnik.com/automatically_update_github_pages_with_travis_example/

set -o errexit -o nounset

REV=$(git rev-parse --short HEAD)

cd build

git init
git config user.name "CI"
git config user.email "webmaster@hacktun.es"

git remote add dest "https://${GH_TOKEN}@${GH_REF}" > /dev/null 2>&1
git fetch --depth=1 dest gh-pages > /dev/null 2>&1
git reset dest/gh-pages

git add .
git commit -m "Auto-build of ${REV}"
git push dest HEAD:gh-pages > /dev/null 2>&1
