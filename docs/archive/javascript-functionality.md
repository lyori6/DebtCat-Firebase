# DebtCat JavaScript Functionality Guide

## Overview

This document provides a comprehensive guide to the JavaScript functionality used throughout the DebtCat website. It explains the core JavaScript modules, event handling, dynamic content loading, and other interactive elements that power the site's user experience.

## Core JavaScript Files

The website uses several JavaScript files, each with a specific purpose:

1. **`/js/components.js`**: Handles dynamic loading of header and footer components
2. **`/js/static-articles.js`**: Manages article content loading and rendering
3. **`/js/mobile-nav.js`**: Controls mobile navigation menu behavior
4. **`/js/accordion.js`**: Implements accordion functionality for FAQ sections
5. **`/update-footers.js`**: Utility script for updating footer components across all pages

## Component Loading System

### Header and Footer Loading

The component loading system dynamically injects header and footer HTML into pages:

```javascript
// components.js
document.addEventListener('DOMContentLoaded', function() {
  // Load header
  const headerElement = document.getElementById('header');
  if (headerElement) {
    fetch('/components/header.html')
      .then(response => response.text())
      .then(data => {
        headerElement.innerHTML = data;
        initializeNavMenu(); // Initialize mobile menu after header loads
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

### Implementation in HTML

To use the component loading system, pages include:

```html
<div id="header"></div>
<!-- Page content -->
<div id="footer"></div>
<script src="/js/components.js"></script>
```

### Error Handling

The component loading system includes error handling to prevent page failures:

```javascript
function loadComponent(elementId, componentPath, callback) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  fetch(componentPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load ${componentPath}: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      element.innerHTML = data;
      if (callback && typeof callback === 'function') {
        callback();
      }
    })
    .catch(error => {
      console.error(error);
      element.innerHTML = `<div class="error-message">Failed to load component</div>`;
    });
}
```

## Mobile Navigation

### Mobile Menu Toggle

The mobile menu is implemented with this JavaScript:

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

### Menu Animation

The menu button animation is controlled by CSS, with JavaScript toggling the `active` class:

```css
.menu-icon span, 
.menu-icon:before, 
.menu-icon:after {
  transition: transform 0.3s ease;
}

.menu-button.active .menu-icon span {
  opacity: 0;
}

.menu-button.active .menu-icon:before {
  transform: translateY(7px) rotate(45deg);
}

.menu-button.active .menu-icon:after {
  transform: translateY(-7px) rotate(-45deg);
}
```

## Article System

### Article Content Loading

The article system loads content from JSON data:

```javascript
// static-articles.js
function loadArticleContent(articleSlug) {
  fetch('/data/articles.json')
    .then(response => response.json())
    .then(data => {
      const article = data.articles.find(a => a.slug === articleSlug);
      if (article) {
        renderArticle(article);
      } else {
        showArticleError('Article not found');
      }
    })
    .catch(error => {
      console.error('Error loading article data:', error);
      showArticleError('Failed to load article');
    });
}

function renderArticle(article) {
  document.title = `DebtCat | ${article.title}`;
  
  // Set meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', article.excerpt);
  }
  
  // Set article content
  document.querySelector('.article-title').textContent = article.title;
  document.querySelector('.article-date').textContent = article.date;
  document.querySelector('.article-category').textContent = article.category;
  document.querySelector('.article-image').src = article.image;
  document.querySelector('.article-image').alt = article.title;
  document.querySelector('.article-body').innerHTML = article.content;
  
  // Show the article container
  document.querySelector('.article-content-container').classList.remove('loading');
}
```

### Article URL Handling

The article system extracts the article slug from the URL:

```javascript
function getArticleSlugFromUrl() {
  const path = window.location.pathname;
  const pathParts = path.split('/');
  const filename = pathParts[pathParts.length - 1];
  return filename.replace('.html', '');
}

document.addEventListener('DOMContentLoaded', function() {
  const articleSlug = getArticleSlugFromUrl();
  loadArticleContent(articleSlug);
});
```

## Form Handling

### Newsletter Signup

The newsletter signup form uses this JavaScript:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const newsletterForm = document.getElementById('newsletter-form');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      
      if (!isValidEmail(email)) {
        showFormError(emailInput, 'Please enter a valid email address');
        return;
      }
      
      // Submit form data
      submitNewsletterSignup(email)
        .then(response => {
          showSuccessMessage('Thank you for subscribing!');
          emailInput.value = '';
        })
        .catch(error => {
          showFormError(emailInput, 'Failed to subscribe. Please try again.');
        });
    });
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function submitNewsletterSignup(email) {
  // Implementation depends on backend service
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => resolve({ success: true }), 1000);
  });
}
```

### Form Validation

Common form validation functions:

```javascript
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      showFormError(field, 'This field is required');
      isValid = false;
    } else {
      clearFormError(field);
    }
  });
  
  return isValid;
}

function showFormError(field, message) {
  // Clear any existing error
  clearFormError(field);
  
  // Add error class to field
  field.classList.add('error');
  
  // Create and insert error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  field.parentNode.appendChild(errorElement);
}

function clearFormError(field) {
  field.classList.remove('error');
  const errorElement = field.parentNode.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
}
```

## Accordion Implementation

The accordion functionality is implemented with this JavaScript:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const accordionTriggers = document.querySelectorAll('.accordion-item-trigger');
  
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const contentId = this.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      
      // Toggle expanded state
      this.setAttribute('aria-expanded', !expanded);
      
      // Toggle content visibility
      if (expanded) {
        content.setAttribute('hidden', '');
      } else {
        content.removeAttribute('hidden');
      }
    });
  });
});
```

## Cookie Banner

The cookie consent banner uses this JavaScript:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const banner = document.getElementById('cookies-banner');
  const acceptButton = document.getElementById('accept-cookies');
  
  if (banner && acceptButton) {
    // Check if user has already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
      // Show the banner
      banner.classList.add('visible');
      
      // Handle accept button click
      acceptButton.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.classList.remove('visible');
      });
    }
  }
});
```

## Image Handling

### Lazy Loading

Images use native lazy loading:

```html
<img src="/images/example.jpg" loading="lazy" alt="Example image">
```

### Image Fallbacks

The article system implements image fallbacks:

```javascript
function setupImageFallbacks() {
  const articleImages = document.querySelectorAll('.article-image');
  
  articleImages.forEach(img => {
    img.onerror = function() {
      this.src = '/images/800x450.svg'; // Default fallback image
      this.alt = 'Image not available';
    };
  });
}
```

## Analytics Integration

The site integrates with Google Analytics:

```javascript
// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('set', 'developer_id.dZGVlNj', true);
gtag('config', 'G-DMRMQNLTBZ');
```

## Utility Functions

### URL Parameter Handling

```javascript
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
```

### DOM Manipulation Helpers

```javascript
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  
  return element;
}
```

## JavaScript Best Practices

### 1. Event Delegation

The site uses event delegation for efficient event handling:

```javascript
// Instead of attaching events to multiple elements
document.addEventListener('click', function(event) {
  // Check if clicked element matches selector
  if (event.target.matches('.accordion-item-trigger')) {
    // Handle accordion toggle
  }
});
```

### 2. Performance Optimization

JavaScript performance is optimized by:

- Using efficient selectors (getElementById, querySelector)
- Minimizing DOM operations
- Debouncing resize and scroll events
- Avoiding jQuery dependencies

```javascript
// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Usage
window.addEventListener('resize', debounce(function() {
  // Handle resize
}, 150));
```

### 3. Error Handling

All asynchronous operations include proper error handling:

```javascript
fetch('/data/articles.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Process data
  })
  .catch(error => {
    console.error('Fetch error:', error);
    // Show user-friendly error message
  });
```

## Debugging Tips

### 1. Console Logging

Strategic console logging is used for debugging:

```javascript
function loadArticle(slug) {
  console.log(`Loading article: ${slug}`);
  // Implementation
}
```

### 2. Error Tracking

Error tracking helps identify issues:

```javascript
window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
  // Optionally send to error tracking service
});
```

### 3. Performance Monitoring

Performance is monitored with console timing:

```javascript
console.time('articleLoad');
loadArticleContent()
  .then(() => console.timeEnd('articleLoad'));
```

## Future JavaScript Improvements

### 1. Module System

Future improvements will include a proper module system:

```javascript
// components.js
export function loadHeader() {
  // Implementation
}

// main.js
import { loadHeader } from './components.js';
```

### 2. Framework Consideration

For more complex functionality, a lightweight framework may be considered:

- Alpine.js for simple reactivity
- Preact for component-based architecture
- Lit for web components

### 3. Build Process

A build process could be implemented for:

- JavaScript bundling and minification
- Tree-shaking unused code
- Polyfill management
- Source maps for debugging
