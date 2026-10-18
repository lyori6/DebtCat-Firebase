# Static Article Mapping Guide

## Overview
This guide explains how to convert regular articles to static articles, including proper image mapping and troubleshooting steps.

## CSV Structure
The article data is stored in `public/data/DebtCat - Articles.csv` with these key fields:
- **Name**: The article title
- **Slug**: URL-friendly version of the title
- **Featured Image**: The Webflow CDN URL for the article's image
- **Category**: Article category (e.g., "debt-collection")
- **Published Date**: When the article was published
- **Body**: The article content in HTML format

## Image Mapping Process
1. **Find the Article in CSV**
   - Look up the article by its Name
   - Copy the Featured Image URL

2. **Extract Image Name**
   - From URL: `https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/[ID]_[filename].jpg`
   - Example: `.../6709b18de51097dd83363b3f_pexels-rdne-9034783.jpg`
   - Extract: `pexels-rdne-9034783.jpg`

3. **Find Local Image**
   - Look in `/public/images/` for:
     1. The exact filename
     2. The -p-800 version (preferred)
     3. Similar filenames if exact match not found

## Article to Image Mapping
Based on the DebtCat - Articles.csv data:

1. **Debt Collector vs. Credit Bureau Disputes**
   - Featured Image: pexels-rdne-9034783-p-800.jpg
   - Original URL: https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/6709b18de51097dd83363b3f_pexels-rdne-9034783.jpg

2. **What to Do When a Debt Collector Contacts You**
   - Featured Image: man-talking-on-cellphone-p-800.jpg
   - Original URL: https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/66e3914d3c8f8eea6a0ac927_pexels-karolina-grabowska-7877116.jpg

3. **Debt Collectors Beware**
   - Featured Image: debt-collectors-beware.jpg
   - Original URL: https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/66ea5592e9931bf9ccea03e1_pexels-sora-shimazaki-5668772.jpg

4. **Debt Consolidation Secrets**
   - Featured Image: debt-consolidation.jpg
   - Original URL: https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/6737f6be73b190ea1ef12dfa_pexels-karolina-grabowska-4968630.jpg

5. **What Really Happens When You Ignore Debt**
   - Featured Image: ignore-debt.jpg
   - Original URL: https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/66fc92b55e6364b299af8452_pexels-alex-green-5699865.jpg

## Step-by-Step Conversion Process

1. **Check the CSV Data First**
   ```bash
   # View the article's data in the CSV
   cat public/data/DebtCat\ -\ Articles.csv
   ```
   - Look for the "Featured Image" field to get the correct image URL

2. **Find the Local Image**
   - Images in the CSV are usually Webflow CDN URLs
   - Look for the corresponding local image in `/public/images/`
   - Use the -p-800 version of the image if available (for consistency)

3. **Create the Static Article**
   ```bash
   # Copy the template
   cp public/articles-static/template.html public/articles-static/[article-slug].html
   ```

4. **Update the Article Content**
   - Copy content from the original article
   - Update meta tags (title, description)
   - Update the image path to use the correct local image
   - Ensure proper category and date

5. **Verify the Image**
   - Launch the article in the browser using localhost:5002
   - Check that the image displays correctly
   - If not, verify the image path and try the -p-800 version

## Common Issues and Solutions

1. **Image Not Displaying**
   - Check if the image exists in `/public/images/`
   - Try using the -p-800 version of the image
   - Verify the image path is correct (should start with /images/)
   - Check the CSV for the correct image mapping

2. **Wrong Image Displayed**
   - Cross-reference with the CSV's Featured Image field
   - Look for the corresponding local image in `/public/images/`
   - Use the image filename from the last part of the CDN URL

3. **Image Aspect Ratio Issues**
   - The article-image-container has a 16:9 aspect ratio
   - Images are set to object-fit: cover
   - If image looks stretched, try using a different version (-p-800, -p-1080, etc.)

## Testing the Static Article

1. **Local Testing**
   ```bash
   # View in browser
   http://localhost:5002/articles-static/[article-slug].html
   ```

2. **Check Elements to Verify**
   - Image loads correctly
   - Proper aspect ratio maintained
   - No console errors
   - All styles applied correctly

## Image Naming Convention

When converting Webflow CDN URLs to local images:
1. Take the last part of the CDN URL after the last slash
2. Look for corresponding image in `/public/images/`
3. Use the -p-800 version if available for consistency
4. If no -p-800 version exists, use the base image

Example:
```
CDN URL: .../6709b18de51097dd83363b3f_pexels-rdne-9034783.jpg
Local Image: /images/pexels-rdne-9034783-p-800.jpg
```

## Verifying Image Mapping

### Before Converting
1. Open the CSV file and find your article
2. Copy the Featured Image URL
3. Note the filename part after the last underscore
4. Search `/public/images/` for matching files
5. Prefer the -p-800 version if available

### After Converting
1. Run the Firebase dev server: `firebase serve`
2. Open the article at localhost:5002
3. Check the image loads properly
4. Verify aspect ratio and scaling
5. Check browser console for any errors

## Troubleshooting Checklist

If the image doesn't display correctly:

1. **Path Issues**
   - [ ] Image path starts with `/images/`
   - [ ] Filename matches exactly (case-sensitive)
   - [ ] File exists in the images directory
   - [ ] No spaces or special characters in filename

2. **Image Version**
   - [ ] Tried the -p-800 version
   - [ ] Checked if base version exists
   - [ ] Verified image dimensions are appropriate

3. **CSV Verification**
   - [ ] Double-checked Featured Image URL in CSV
   - [ ] Verified filename extraction from URL
   - [ ] Confirmed mapping to local image is correct

4. **Browser Issues**
   - [ ] Cleared browser cache
   - [ ] Checked console for 404 errors
   - [ ] Verified Firebase server is running
   - [ ] Tested in different browser
