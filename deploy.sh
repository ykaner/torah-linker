#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Get current date in YYYY-MM-DD format
DATE=$(date +%Y-%m-%d)
ZIP_NAME="dist/torah_linker_${DATE}.zip"

# Remove any existing zip with the same name
rm -f "$ZIP_NAME"

# Create zip file with necessary files
zip -r "$ZIP_NAME" \
    manifest.json \
    popup.html \
    build/content_script.bundle.js \
    build/popup.bundle.js \
    icons/icon16.png \
    icons/icon32.png \
    icons/icon48.png \
    icons/icon128.png \
    LICENSE \
    README.md \
    -x "*.git*" \
    -x "node_modules/*" \
    -x "*.zip" \
    -x "deploy.sh" \
    -x "dist/*"

echo "Created deployment package: $ZIP_NAME"
