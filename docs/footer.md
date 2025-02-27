# Footer Documentation

## Overview
The footer is a critical component of the DebtCat website that appears on all pages. It's implemented using a combination of HTML, CSS, and JavaScript to ensure consistency across the site.

## File Structure
- `public/components/footer.html` - Main footer HTML template
- `public/css/footer.css` - Footer styles
- `update-footers.js` - Script to update footer across all pages

## How It Works

### 1. Footer Template
The footer template (`footer.html`) contains:
- Navigation links (with .html extensions)
- Social media links
- Legal links
- Copyright information

### 2. Footer Styling
The footer styles are in `footer.css` and are automatically included in each page through the update script.

### 3. Footer Update Process
The `update-footers.js` script:
- Reads the footer template from `public/components/footer.html`
- Processes all HTML files in the `public` directory
- Injects the footer CSS if not present
- Replaces existing footer content with the template
- Skips chat.html (special case)

## Making Changes

### To Update Footer Content
1. Edit `public/components/footer.html`
2. Run `node update-footers.js`
3. The changes will be propagated to all pages

### To Update Footer Styling
1. Edit `public/css/footer.css`
2. Run `node update-footers.js` to ensure the CSS is included in all pages

### Important Notes
- Always include .html extensions in footer links
- The footer is automatically injected into all HTML files except chat.html
- Changes to the footer must be followed by running the update script
- The script maintains proper link formats and ensures consistency

## Troubleshooting
If footer links aren't working:
1. Verify links have .html extensions in footer.html
2. Run update-footers.js to propagate changes
3. Check if the page is excluded (like chat.html)
4. Verify the Firebase configuration isn't interfering with URL handling
