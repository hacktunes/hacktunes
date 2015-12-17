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

echo "hacktun.es" > CNAME
git add -A .
git commit -m "Auto-build of ${REV}"
git push -f "https://${GH_TOKEN}@${GH_REF}" HEAD:gh-pages > /dev/null 2>&1
