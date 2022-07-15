#!/bin/sh

git pull
node ./index.js
git add -A
git commit -m"update"
git push
