#!/bin/bash

# Script to update all article files with the missing CSS references

# Directory containing the article files
ARTICLES_DIR="/Users/lyor/DebtCat-Firebase/public/articles-static"

# Loop through all HTML files in the directory
for file in "$ARTICLES_DIR"/*.html; do
  # Skip template file if it exists
  if [[ "$(basename "$file")" == "template.html" ]]; then
    continue
  fi
  
  echo "Processing $file..."
  
  # Add the missing CSS references after fontawesome.css
  sed -i '' -e '/<link href="\/css\/fontawesome.css" rel="stylesheet" type="text\/css">/a\
  <link href="/css/webflow.css" rel="stylesheet" type="text/css">\
  <link href="/css/debtcat.webflow.css" rel="stylesheet" type="text/css">' "$file"
  
  echo "Updated $file"
done

echo "All article files have been updated!"
