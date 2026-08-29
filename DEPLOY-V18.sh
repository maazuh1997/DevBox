#!/bin/bash
set -e
cd "$(dirname "$0")"
npm install
npm run build
git add .
git commit -m "Build DevBox v18 security workbenches" || true
git push origin main
