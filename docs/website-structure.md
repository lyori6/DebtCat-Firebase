# DebtCat Website Structure Documentation

## Overview

DebtCat is a debt management web application that was successfully migrated from Webflow to Firebase. The site follows a static-first approach with templated articles, standardized components, and a clean, maintainable codebase. This document provides a comprehensive overview of the website's structure, components, and implementation details to help team members navigate and understand the codebase.

## Project Architecture

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Hosting**: Firebase
- **Content Management**: Static HTML templates with JSON data
- **Development Approach**: AI-assisted coding

### Directory Structure

```
DebtCat-Firebase/
├── public/                     # Main web content
│   ├── articles/               # Dynamic article pages
│   ├── articles-static/        # Static article pages
│   ├── assets/                 # Various assets 
│   ├── components/             # Reusable UI components
│   │   ├── header.html         # Standard header
│   │   ├── header-white.html   # White header variant
│   │   └── footer.html         # Standard footer
│   ├── css/                    # Stylesheets
│   │   ├── normalize.css       # CSS reset
│   │   ├── webflow.css         # Core framework styles
│   │   ├── debtcat.webflow.css # Site-wide styles
│   │   ├── articles.css        # Article list page styles
│   │   ├── article-detail.css  # Article detail page styles
│   │   ├── footer.css          # Footer-specific styles
│   │   ├── static-articles.css # Static article styles
│   │   └── ...
│   ├── images/                 # Image assets
│   ├── js/                     # JavaScript files
│   │   ├── components.js       # Component loading logic
│   │   └── ...
│   ├── data/                   # Data files
│   │   └── articles.json       # Article metadata
│   ├── index.html              # Homepage
│   ├── articles.html           # Articles listing page
│   ├── chat.html               # Chat feature page
│   ├── detail_articles.html    # Article detail template
│   └── ...
├── docs/                       # Documentation
├── firebase.json               # Firebase configuration
└── ...
```

## Key Components

### 1. Header Component

The header is implemented as a reusable component with two variants:

- **Standard Header** (`/components/header.html`): Dark text on light background
- **White Header** (`/components/header-white.html`): White text for dark backgrounds

#### Implementation:

```html
<nav class="navbar">
  <div class="navbar-wrapper">
    <a href="/index.html" class="navbar-brand">
      <img src="/images/debtcat-logo-black.svg" loading="lazy" width="70" height="Auto" alt="DebtCat logo">
    </a>
    <button class="menu-button" aria-label="Toggle navigation menu">
      <div class="menu-icon">
        <span></span>
      </div>
    </button>
    <ul class="nav-menu">
      <li><a href="/start-dispute.html" class="nav-link">Dispute</a></li>
      <li><a href="/chat.html" class="nav-link">Chat</a></li>
      <li><a href="/articles.html" class="nav-link">Guides</a></li>
      <li><a href="/s/about.html" class="nav-link">About Us</a></li>
    </ul>
  </div>
</nav>
```

The white variant is implemented by adding the `navbar-white` class to the nav element.

### 2. Footer Component

The footer is implemented as a reusable component:

- **Standard Footer** (`/components/footer.html`): Consistent across all pages

#### Implementation:

```html
<footer class="footer">
  <div class="footer-container">
    <div class="footer-nav">
      <div class="footer-links">
        <a href="/start-dispute.html" class="footer-link">Dispute</a>
        <a href="/articles.html" class="footer-link">Guides</a>
        <a href="/chat.html" class="footer-link">Debt Chat</a>
        <a href="/s/about.html" class="footer-link">About Us</a>
        <a href="/s/fdcpa-checklist.html" class="footer-link">FDCPA Checklist</a>
      </div>
      <div class="footer-social">
        <!-- Social media links -->
      </div>
    </div>
    <div class="footer-divider"></div>
    <div class="footer-bottom">
      <div class="footer-copyright">© 2025 DebtCat. All rights reserved | Developed and authored with AI assistance ✨</div>
      <div class="footer-legal">
        <!-- Legal links -->
      </div>
    </div>
  </div>
</footer>
```

### 3. Article System

The website uses two approaches for articles:

1. **Static Articles** (`/articles-static/`): Pre-rendered HTML files with fixed content
2. **Dynamic Articles** (`/articles/`): Template-based articles that load content from JSON data

#### Static Article Template Structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{TITLE}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="/css/normalize.css" rel="stylesheet">
  <link href="/css/article-detail.css" rel="stylesheet">
</head>
<body>
  <div class="container-body-inverse">
    <!-- Header loaded via components.js -->
    <div class="content-container">
      <div class="article-content-container">
        <img src="/images/{{IMAGE}}" loading="lazy" alt="{{TITLE}}" class="article-image">
        <h1 class="article-title">{{TITLE}}</h1>
        <div class="article-metadata">
          <span class="article-date">{{DATE}}</span>
          <span class="article-category">{{CATEGORY}}</span>
        </div>
        <div class="article-body rich-text-block">
          {{CONTENT}}
        </div>
      </div>
    </div>
    <!-- Footer loaded via components.js -->
  </div>
  <script src="/js/components.js"></script>
</body>
</html>
```

## Styling System

### CSS Architecture

The site uses a layered CSS approach:

1. **normalize.css**: Base styling for cross-browser consistency
2. **webflow.css**: Core framework styles (remnant from Webflow)
3. **debtcat.webflow.css**: Main site-wide styling
4. **Page-specific CSS**: Styles for specific page types (articles.css, article-detail.css, etc.)
5. **Component CSS**: Styles for specific components (footer.css, etc.)

### Key CSS Variables

```css
:root {
  --primary-white: #fefeff;
  --montserrat: Montserrat, sans-serif;
  --primary-black: #1a1a1e;
  --roboto: Roboto, sans-serif;
  --secondary-yellow: #cbf84c;
  --primary-blue: #3358ef;
  --tertiary-green: #1dc939;
  --tertiary-red: #da0f0f;
}
```

### Responsive Design

The site uses standard media queries for responsive design:

```css
@media screen and (max-width: 991px) {
  /* Tablet styles */
}

@media screen and (max-width: 767px) {
  /* Mobile landscape styles */
}

@media screen and (max-width: 479px) {
  /* Mobile portrait styles */
}
```

## JavaScript Components

### Component Loading System

The website uses a component loading system to include the header and footer across pages:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Load header
  const headerElement = document.getElementById('header');
  if (headerElement) {
    fetch('/components/header.html')
      .then(response => response.text())
      .then(data => {
        headerElement.innerHTML = data;
        initializeNavMenu();
      })
      .catch(error => console.error('Error loading header:', error));
  }
  
  // Load footer
  const footerElement = document.getElementById('footer');
  if (footerElement) {
    fetch('/components/footer.html')
      .then(response => response.text())
      .then(data => {
        footerElement.innerHTML = data;
      })
      .catch(error => console.error('Error loading footer:', error));
  }
});
```

### Mobile Menu

The mobile menu is implemented with JavaScript:

```javascript
function initializeNavMenu() {
  const menuButton = document.querySelector('.menu-button');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function() {
      menuButton.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!menuButton.contains(event.target) && !navMenu.contains(event.target)) {
        menuButton.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}
```

## URL Structure

The website uses both clean URLs and .html extensions:

1. **Clean URLs**: Implemented for better SEO and user experience
2. **.html Extensions**: Used for direct file access

### Firebase Configuration

```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "/articles",
        "destination": "/articles.html"
      },
      {
        "source": "/articles/**",
        "destination": "/articles/**"
      }
    ]
  }
}
```

## Content Management

### Article Data Structure

Articles are managed through a combination of:
- CSV data (`DebtCat - Articles.csv`)
- JSON data (`/public/data/articles.json`)
- Static HTML files

#### Article JSON Structure:

```json
{
  "articles": [
    {
      "title": "Debt Collector vs. Credit Bureau Disputes",
      "slug": "debt-collector-vs-credit-bureau-disputes-understanding-the-difference",
      "image": "/images/pexels-rdne-9034783-p-800.jpg",
      "category": "debt-collection",
      "date": "February 12, 2025",
      "excerpt": "Learn the key differences between disputing with a debt collector versus a credit bureau.",
      "content": "..."
    },
    // Additional articles...
  ]
}
```

### Image Management

Images are stored in `/public/images/` with consistent naming conventions:
- Original filename
- Modified versions with suffixes: `-p-800`, `-p-1080`, etc.

## Page Types

### 1. Homepage (`index.html`)
- Hero section with call-to-action
- Popular guides section
- FAQ accordion
- Newsletter signup

### 2. Articles List (`articles.html`)
- Grid layout of article cards
- Category filtering
- Responsive design

### 3. Article Detail (`detail_articles.html`, `/articles-static/*.html`)
- Featured image
- Article metadata (date, category)
- Rich text content
- Related articles

### 4. Chat Page (`chat.html`)
- Chat interface
- AI interaction
- Special styling and functionality

## Technical Notes

### Webflow Migration
The site was migrated from Webflow, so some legacy code and classes remain:
- `w-` prefixed classes
- Some redundant CSS rules
- Webflow-specific markup patterns

### Future Improvements
Planned improvements include:
1. Complete removal of Webflow dependencies
2. Standardization of component implementations
3. Consolidation of CSS files
4. Implementation of a more robust content management system

## Troubleshooting

### Common Issues

1. **Component Loading Issues**:
   - Check the DOM for elements with IDs `header` and `footer`
   - Verify component paths in fetch calls
   - Check browser console for errors

2. **Image Display Problems**:
   - Ensure images exist in `/public/images/`
   - Try using the -p-800 version of images for consistency
   - Verify image paths start with `/images/`

3. **Styling Inconsistencies**:
   - Check CSS load order
   - Inspect element for competing CSS rules
   - Verify specific CSS files are included

## Contribution Guidelines

When working with this codebase:
1. **HTML**:
   - Use semantic HTML elements
   - Follow proper heading hierarchy
   - Include appropriate ARIA attributes
   - Maintain consistent component structure

2. **CSS**:
   - Follow the established CSS hierarchy
   - Use existing variables for colors and fonts
   - Add page-specific styles to the appropriate CSS file
   - Document complex CSS patterns

3. **JavaScript**:
   - Keep scripts modular and focused
   - Use vanilla JavaScript (no frameworks)
   - Document complex functionality
   - Maintain error handling
