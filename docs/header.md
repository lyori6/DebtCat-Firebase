# Header Implementation Guide

The DebtCat header has been simplified and standardized across the website. This document explains the implementation and available options.

## Components

Two header components are available:
1. `/components/header.html` - Standard header with dark text
2. `/components/header-white.html` - White variant for dark backgrounds

## Implementation

1. Include required CSS:
```html
<link href="/css/normalize.css" rel="stylesheet" type="text/css">
<link href="/css/static-articles.css" rel="stylesheet" type="text/css">
```

2. Include the appropriate header component:
```html
<!-- For standard header -->
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

<!-- For white header -->
<nav class="navbar navbar-white">
  <!-- Same structure as above but with white logo -->
  <img src="/images/debtcat-logo-inverse.svg" ...>
</nav>
```

3. Include the JavaScript for mobile menu functionality:
```html
<script src="/js/static-articles.js"></script>
```

## Features

### Standard Header
- Black logo and dark text navigation
- Blue underline on hover
- Suitable for light backgrounds
- Default state, no additional classes needed

### White Header
- White logo and text
- Yellow (#CBF84C) underline on hover
- Transparent background
- Dark background for mobile menu
- Add `navbar-white` class to use

## Mobile Menu

The mobile menu is automatically handled by the included JavaScript:
- Appears on screens smaller than 992px
- Three-line menu icon with smooth X animation
- Slides in from top with fade effect
- Dark background for white variant

## Styling Details

The header includes:
- Fixed positioning at top
- Clean, minimal design
- 18px Montserrat font (500 weight)
- 2px underline on hover
- Smooth transitions
- Responsive logo size (160px desktop, 140px mobile)
- Proper spacing (24px horizontal padding)

## URL Structure

All internal links must include .html extension:
```
/index.html
/start-dispute.html
/chat.html
/articles.html
/s/about.html
```

## Page-by-Page Implementation

Headers are implemented on a page-by-page basis due to variations:
1. Copy appropriate header component
2. Add required CSS and JavaScript
3. Ensure all links have .html extension
4. Test mobile menu functionality

## Notes

- The header is designed to work with both light and dark backgrounds
- Mobile menu automatically adjusts its colors based on the variant
- Logo size is responsive, adjusting for mobile screens
- Navigation uses Montserrat font for consistency
