# DebtCat Component Guide

## Introduction

This guide provides a detailed overview of the various UI components used throughout the DebtCat website. It explains how components are structured, implemented, and how they interact with one another. This document is particularly useful for designers and developers who need to understand the front-end architecture of the site.

## Component Architecture

The DebtCat website uses a component-based architecture with these key characteristics:

1. **HTML-First Approach**: Components are primarily HTML-based with minimal JavaScript
2. **CSS Modularity**: Component-specific styles are separated where possible
3. **Component Loading**: Key components like headers and footers are loaded dynamically
4. **Responsive Design**: All components adapt to different screen sizes

## Core Components

### 1. Header Component

The header is one of the primary navigation components, available in two variants:

#### Implementation Details

**File Location**: 
- `/public/components/header.html` (standard version)
- `/public/components/header-white.html` (white version for dark backgrounds)

**Loading Mechanism**:
The header is loaded via JavaScript:

```javascript
// Inside components.js
function loadHeader() {
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
}
```

**Usage in Pages**:
```html
<!-- In page files -->
<div id="header"></div>
<script src="/js/components.js"></script>
```

#### Component Structure

The header has this structure:
```html
<nav class="navbar">
  <div class="navbar-wrapper">
    <!-- Logo -->
    <a href="/index.html" class="navbar-brand">
      <img src="/images/debtcat-logo-black.svg" loading="lazy" width="70" height="Auto" alt="DebtCat logo">
    </a>
    
    <!-- Mobile menu toggle button -->
    <button class="menu-button" aria-label="Toggle navigation menu">
      <div class="menu-icon">
        <span></span>
      </div>
    </button>
    
    <!-- Navigation links -->
    <ul class="nav-menu">
      <li><a href="/start-dispute.html" class="nav-link">Dispute</a></li>
      <li><a href="/chat.html" class="nav-link">Chat</a></li>
      <li><a href="/articles.html" class="nav-link">Guides</a></li>
      <li><a href="/s/about.html" class="nav-link">About Us</a></li>
    </ul>
  </div>
</nav>
```

#### Variants

1. **Standard Header**: Dark text on light background (default)
   - Uses black logo
   - Blue hover underline effect

2. **White Header**: White text for dark backgrounds
   - Uses white logo
   - Yellow hover underline effect
   - Applied by adding `navbar-white` class to the `nav` element

#### Mobile Menu Functionality

The mobile menu works through this mechanism:

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

### 2. Footer Component

The footer provides consistent navigation and branding across all pages.

#### Implementation Details

**File Location**: `/public/components/footer.html`

**Loading Mechanism**:
Similar to the header, the footer is loaded via JavaScript:

```javascript
// Inside components.js
function loadFooter() {
  const footerElement = document.getElementById('footer');
  if (footerElement) {
    fetch('/components/footer.html')
      .then(response => response.text())
      .then(data => {
        footerElement.innerHTML = data;
      })
      .catch(error => console.error('Error loading footer:', error));
  }
}
```

**Usage in Pages**:
```html
<!-- In page files -->
<div id="footer"></div>
<script src="/js/components.js"></script>
```

#### Component Structure

The footer has this structure:
```html
<footer class="footer">
  <div class="footer-container">
    <!-- Navigation links -->
    <div class="footer-nav">
      <div class="footer-links">
        <a href="/start-dispute.html" class="footer-link">Dispute</a>
        <a href="/articles.html" class="footer-link">Guides</a>
        <a href="/chat.html" class="footer-link">Debt Chat</a>
        <a href="/s/about.html" class="footer-link">About Us</a>
        <a href="/s/fdcpa-checklist.html" class="footer-link">FDCPA Checklist</a>
      </div>
      
      <!-- Social media links -->
      <div class="footer-social">
        <a href="https://www.instagram.com/debtcat/" class="footer-social-link">
          <img src="/images/social/Platform=Instagram, Color=Negative.svg" alt="Instagram">
        </a>
        <!-- Other social links... -->
      </div>
    </div>
    
    <div class="footer-divider"></div>
    
    <!-- Copyright and legal links -->
    <div class="footer-bottom">
      <div class="footer-copyright">© 2025 DebtCat. All rights reserved</div>
      <div class="footer-legal">
        <a href="/s/tos.html" class="footer-legal-link">Terms Of Service</a>
        <a href="/s/refund.html" class="footer-legal-link">Refund Policy</a>
        <a href="/s/privacy-policy.html" class="footer-legal-link">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>
```

#### Update Process

The footer is maintained through a special update script:
- `/update-footers.js` can be run to update the footer across all pages
- Updates footer content and ensures consistent implementation

### 3. Article Card Component

Article cards are used to display article previews on listing pages.

#### Implementation

```html
<div class="article-card">
  <div class="article-image-container">
    <img src="/images/article-image.jpg" alt="Article Title" class="article-image">
  </div>
  <div class="article-content">
    <h3 class="article-title">Article Title</h3>
    <p class="article-excerpt">Brief excerpt from the article that gives readers a preview...</p>
    <div class="article-metadata">
      <span class="article-date">February 20, 2025</span>
      <span class="article-category">Debt Collection</span>
    </div>
  </div>
</div>
```

#### CSS Implementation

The article card uses these key CSS properties:
```css
.article-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
```

#### Responsive Behavior

- On desktop: Cards appear in a 3-column grid
- On tablet: Cards appear in a 2-column grid
- On mobile: Cards appear in a 1-column layout

### 4. Button Components

The site uses a consistent set of button components across all pages.

#### Primary Button

```html
<button class="button-primary">Get Started</button>
<!-- OR -->
<a href="/start-dispute.html" class="button-primary">Get Started</a>
```

```css
.button-primary {
  background-color: var(--primary-blue);
  color: var(--primary-white);
  font-family: var(--montserrat);
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  display: inline-block;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.3s ease;
}
```

#### Secondary Button

```html
<button class="button-secondary">Learn More</button>
```

```css
.button-secondary {
  background-color: var(--secondary-yellow);
  color: var(--primary-black);
  /* Other properties similar to primary button */
}
```

#### Text Button

```html
<button class="button-text">View Details</button>
```

```css
.button-text {
  background: none;
  color: var(--primary-blue);
  text-decoration: underline;
  /* Other properties... */
}
```

### 5. Accordion Component

Used for FAQ sections and collapsible content.

#### Implementation

```html
<div class="accordion-wrapper">
  <div class="accordion-item">
    <button id="q1" class="accordion-item-trigger" aria-expanded="false" aria-controls="a1">
      <span class="accordion-title">What is DebtCat?</span>
      <span class="accordion-icon"></span>
    </button>
    <div id="a1" class="accordion-item-content" aria-labelledby="q1" hidden>
      <p>DebtCat is a platform that helps you manage your debts effectively...</p>
    </div>
  </div>
  <!-- Additional accordion items... -->
</div>
```

#### JavaScript Functionality

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const accordionTriggers = document.querySelectorAll('.accordion-item-trigger');
  
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const contentId = this.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      
      this.setAttribute('aria-expanded', !expanded);
      
      if (expanded) {
        content.setAttribute('hidden', '');
      } else {
        content.removeAttribute('hidden');
      }
    });
  });
});
```

## Page Templates

### 1. Standard Page Template

The standard page template includes these components:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Page Title | DebtCat</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="/css/normalize.css" rel="stylesheet">
  <link href="/css/webflow.css" rel="stylesheet">
  <link href="/css/debtcat.webflow.css" rel="stylesheet">
  <!-- Page-specific CSS -->
</head>
<body>
  <div class="container-body">
    <!-- Header component -->
    <div id="header"></div>
    
    <!-- Main content -->
    <div class="content-container">
      <!-- Page-specific content here -->
    </div>
    
    <!-- Footer component -->
    <div id="footer"></div>
  </div>
  
  <!-- Scripts -->
  <script src="/js/components.js"></script>
  <!-- Page-specific scripts -->
</body>
</html>
```

### 2. Article Template

The article template extends the standard template with article-specific components:

```html
<!-- Standard head content... -->
<body>
  <div class="container-body-inverse">
    <div id="header"></div>
    <div class="content-container">
      <div class="article-content-container">
        <img src="/images/article-image.jpg" alt="Article Title" class="article-image">
        <h1 class="article-title">Article Title</h1>
        <div class="article-metadata">
          <span class="article-date">February 20, 2025</span>
          <span class="article-category">Debt Collection</span>
        </div>
        <div class="article-body rich-text-block">
          <!-- Article content -->
        </div>
      </div>
      <section class="section-related-articles">
        <!-- Related articles -->
      </section>
    </div>
    <div id="footer"></div>
  </div>
  <script src="/js/components.js"></script>
</body>
```

## Component Interactions

### 1. Dynamic Content Loading

Several components use dynamic content loading:

- **Header and Footer**: Loaded via fetch API
- **Articles**: Content can be loaded from JSON data
- **Related Articles**: Dynamically populated based on category

### 2. State Management

Simple state management is implemented for:

- **Mobile Menu**: Open/closed state
- **Accordion**: Expanded/collapsed state
- **Tab Interfaces**: Active tab tracking

### 3. Event Handling

Common event patterns:

- **Click Handlers**: For buttons, accordion toggles, etc.
- **Window Resize**: For responsive layout adjustments
- **Form Submissions**: For newsletter signup, contact forms, etc.

## Component Customization

### Adding New Navigation Items

To add a new navigation item to the header:

1. Edit `/components/header.html`
2. Add a new list item to the `nav-menu` list:
   ```html
   <li><a href="/new-page.html" class="nav-link">New Page</a></li>
   ```
3. Run the component update script if needed

### Creating New Article Cards

To create a new article card:

1. Follow the HTML structure in the "Article Card Component" section
2. Ensure the image is in the `/images/` directory
3. Update the article metadata as needed

### Adapting Components for Different Pages

Components can be adapted for different pages by:

1. Using the appropriate variant (e.g., standard vs. white header)
2. Adding page-specific CSS classes
3. Modifying content while maintaining the core structure

## Common Component Issues & Solutions

### 1. Header Not Loading

**Issue**: Header component fails to load on the page
**Solution**:
- Ensure there's a `<div id="header"></div>` element in the page
- Verify that components.js is properly included
- Check browser console for errors
- Confirm the file path to header.html is correct

### 2. Mobile Menu Not Working

**Issue**: Mobile menu button doesn't expand the navigation
**Solution**:
- Check that the menu button has the correct class
- Ensure the JavaScript is initialized after the component is loaded
- Verify that CSS transitions are properly defined

### 3. Images Not Displaying Correctly

**Issue**: Images in components appear broken or incorrectly sized
**Solution**:
- Verify image paths start with `/images/`
- Check that images exist in the specified directory
- Ensure responsive image containers have proper CSS

## Best Practices for Component Development

1. **Maintain Consistency**:
   - Follow established naming conventions
   - Use the same component structure
   - Keep styles consistent with existing components

2. **Ensure Responsive Behavior**:
   - Test all components at different screen sizes
   - Use relative units (%, em, rem) for sizing
   - Implement appropriate media queries

3. **Optimize Performance**:
   - Use lazy loading for images
   - Minimize JavaScript execution
   - Reduce unnecessary DOM operations

4. **Maintain Accessibility**:
   - Include proper ARIA attributes
   - Ensure keyboard navigation
   - Maintain sufficient color contrast
   - Use semantic HTML elements

5. **Document Component Changes**:
   - Update documentation when modifying components
   - Include comments for complex functionality
   - Maintain a changelog of significant changes

## Component Migration Notes

As the site was migrated from Webflow, some components retain Webflow-specific characteristics:

1. **CSS Classes**: Some components still use Webflow-prefixed classes (`w-`) which will be gradually phased out
2. **Div Structure**: Some nested div elements are remnants of Webflow's approach
3. **Script Tags**: Some pages may contain Webflow-specific script references

These elements are being systematically replaced with cleaner, more maintainable implementations as part of the ongoing development process.
