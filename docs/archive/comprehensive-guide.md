# DebtCat Website: Comprehensive Developer & Designer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Directory Structure](#directory-structure)
4. [Key Components](#key-components)
5. [Page Types & Templates](#page-types--templates)
6. [JavaScript Functionality](#javascript-functionality)
7. [Styling System](#styling-system)
8. [Static Article System](#static-article-system)
9. [Workflow Guide](#workflow-guide)
10. [Common Issues & Solutions](#common-issues--solutions)

## Project Overview

DebtCat is a web platform that helps users manage their debts through chat and dispute tools. The site was recently migrated from Webflow to Firebase, focusing on a static-first approach with templated articles for improved performance and maintainability.

### Migration Benefits
- **Performance**: Static HTML pages load faster than dynamic content
- **Cost Efficiency**: Reduced hosting costs with Firebase
- **Maintainability**: Simplified codebase with clear separation of concerns
- **Flexibility**: Greater control over code structure and optimization

## Architecture & Technology Stack

### Core Technologies
- **HTML/CSS/JavaScript**: Standard web technologies for structure, style, and functionality
- **Firebase Hosting**: For deploying and serving the website
- **CSS Custom Properties**: For consistent theming and styling
- **Responsive Design**: Mobile-first approach with specific breakpoints

### Development Approach
- **Component-Based**: Modular components (header, footer, cards) for consistency and reusability
- **Static-First**: Pre-rendered HTML for core content with JavaScript enhancements
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with JS

## Directory Structure

```
DebtCat-Firebase/
├── public/                 # Root directory for all web content
│   ├── components/         # Reusable HTML components
│   │   ├── header.html     # Main navigation header
│   │   ├── header-white.html # Alternative header style
│   │   └── footer.html     # Site footer
│   ├── css/                # Stylesheet files
│   │   ├── normalize.css   # CSS reset
│   │   ├── webflow.css     # Base styles from Webflow
│   │   ├── debtcat.webflow.css # Main site styles
│   │   ├── articles.css    # Article-specific styles
│   │   ├── static-articles.css # Static article styles
│   │   ├── footer.css      # Footer-specific styles
│   │   └── ...             # Other component-specific styles
│   ├── js/                 # JavaScript files
│   │   ├── components.js   # Component loading logic
│   │   ├── articles.js     # Article listing and rendering
│   │   ├── static-articles.js # Static article functionality
│   │   ├── mobile-nav.js   # Mobile navigation handling
│   │   └── ...             # Other functionality
│   ├── images/             # Image assets
│   ├── data/               # Data files (CSV, JSON)
│   ├── articles/           # Dynamic article templates
│   ├── articles-static/    # Static article files
│   │   └── template.html   # Base template for static articles
│   ├── s/                  # Static pages (about, terms, etc.)
│   └── index.html          # Homepage
├── docs/                   # Documentation files
└── ...                     # Configuration files
```

## Key Components

### Header Component
Located at `/public/components/header.html` and `/public/components/header-white.html`

The header provides site-wide navigation and branding:
- Logo linking to homepage
- Mobile-responsive navigation menu
- Main site sections (Dispute, Chat, Guides, About Us)

Usage:
```html
<div id="header"></div>
<script>
  // Load header component
  fetch('/components/header.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('header').innerHTML = html;
    });
</script>
```

### Footer Component
Located at `/public/components/footer.html`

The footer provides consistent navigation and branding across all pages:
- Secondary navigation links
- Social media links
- Copyright information
- Legal links (Terms, Privacy, Refund)

Usage:
```html
<div id="footer"></div>
<script>
  // Load footer component
  fetch('/components/footer.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('footer').innerHTML = html;
    });
</script>
```

### Article Cards
Used on the articles listing page and homepage to display article previews:
- Featured image
- Title
- Category pill
- Summary text
- Publication date

## Page Types & Templates

### Homepage
`/public/index.html`
- Hero section with call-to-action
- Featured articles section
- FAQ accordion
- Newsletter signup

### Articles Listing
`/public/articles.html`
- Article grid with filtering
- Category navigation
- Dynamically loaded from CSV data

### Static Article Pages
`/public/articles-static/*.html`
- Based on template.html
- Consistent header/footer
- Featured image
- Article content
- Metadata (date, author, category)

### Form Pages
- Dispute form
- Chat interface
- Contact forms

## JavaScript Functionality

### Component Loading
`/public/js/components.js`
- Dynamically loads header and footer components
- Provides fallback content during loading
- Handles errors gracefully

```javascript
// Load components sequentially
loadComponent('header', headerPath)
  .then(() => loadComponent('footer', '/components/footer.html'))
```

### Mobile Navigation
`/public/js/mobile-nav.js` and within component scripts
- Toggle menu visibility
- Handle touch events
- Manage accessibility attributes
- Close on outside click

### Article Functionality
`/public/js/articles.js`
- Fetch and parse article data from CSV
- Generate article cards dynamically
- Handle filtering and sorting
- Manage pagination

### Static Article Enhancements
`/public/js/static-articles.js`
- Mobile menu functionality
- Image error handling
- Accessibility improvements

## Styling System

### Color Palette
Primary brand colors defined as CSS custom properties:
```css
:root {
  --primary-blue: #3358EF;
  --secondary-blue: #2A47C3;
  --accent-yellow: #FFD60A;
  --text-dark: #1A1A1A;
  --text-light: #FFFFFF;
  --background-light: #F5F5F5;
  --background-dark: #121212;
}
```

### Typography
- **Primary Font**: Montserrat (headings, UI elements)
- **Secondary Font**: Merriweather (body text, articles)
- **Tertiary Font**: Roboto (technical text, forms)

Font sizes follow a consistent scale with responsive adjustments.

### Component Styling
- **Buttons**: Multiple styles (primary, secondary, text)
- **Cards**: Consistent shadow, radius, and hover effects
- **Forms**: Standardized input styling and validation states
- **Navigation**: Desktop and mobile variants

### Responsive Design
Mobile-first approach with breakpoints at:
- 480px (mobile)
- 768px (tablet)
- 992px (desktop)
- 1200px (large desktop)

## Static Article System

### Overview
The static article system converts dynamic Webflow articles to static HTML files for improved performance and maintainability.

### Article Creation Process
1. **CSV Mapping**: Article data stored in `/public/data/DebtCat - Articles.csv`
2. **Template**: Base structure in `/public/articles-static/template.html`
3. **Image Mapping**: Webflow CDN images mapped to local files
4. **Content Conversion**: Rich text converted to static HTML

### Image Handling
When converting Webflow CDN URLs to local images:
1. Extract filename from the CDN URL (after last slash)
2. Look for corresponding image in `/public/images/`
3. Use the -p-800 version if available for consistency
4. Fall back to base image if necessary

Example:
```
CDN URL: .../6709b18de51097dd83363b3f_pexels-rdne-9034783.jpg
Local Image: /images/pexels-rdne-9034783-p-800.jpg
```

### Testing Static Articles
1. Run local server: `firebase serve`
2. Access article: `http://localhost:5002/articles-static/[article-slug].html`
3. Verify images, styles, and content

## Workflow Guide

### For Designers

#### Modifying Components
1. Locate the component in `/public/components/`
2. Make changes to HTML structure
3. Update corresponding CSS in `/public/css/`
4. Test across multiple pages and viewports

#### Adding New Pages
1. Use existing pages as templates
2. Include component loading for header/footer
3. Link required CSS and JS files
4. Test responsive behavior

#### Styling Guidelines
- Use existing CSS custom properties for colors
- Follow established typography patterns
- Maintain consistent spacing using the existing system
- Test all changes across device sizes

### For Developers

#### Adding JavaScript Functionality
1. Create or modify files in `/public/js/`
2. Follow the existing module pattern
3. Use progressive enhancement
4. Test with JS disabled to ensure basic functionality

#### Creating New Components
1. Create HTML file in `/public/components/`
2. Add corresponding CSS in `/public/css/`
3. Update component loading in affected pages
4. Document usage pattern

## Common Issues & Solutions

### Image Display Problems
- **Issue**: Images not displaying correctly in static articles
- **Solution**: Verify image path, check for correct version (-p-800), ensure file exists

### Component Loading Errors
- **Issue**: Header or footer not loading
- **Solution**: Check network requests, verify path, check for JS errors

### Mobile Navigation Issues
- **Issue**: Mobile menu not working correctly
- **Solution**: Inspect event listeners, check CSS classes, test on multiple devices

### CSS Inconsistencies
- **Issue**: Styling appears different across pages
- **Solution**: Check for missing CSS imports, inspect specificity conflicts

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs/hosting)
- [Web Development Best Practices](https://developer.mozilla.org/en-US/docs/Learn)
- [Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

*This documentation is maintained by the DebtCat development team. Last updated: February 2025.*
