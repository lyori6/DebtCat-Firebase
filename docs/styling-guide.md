# DebtCat Styling Guide

## Introduction

This document provides a comprehensive overview of the DebtCat website's styling system, designed specifically for designers and front-end developers. It details the color palette, typography, component styling, CSS organization, and responsive design principles used throughout the site.

## Color Palette

The DebtCat website uses a consistent color palette defined by CSS variables:

```css
:root {
  --primary-white: #fefeff;      /* Background, text on dark backgrounds */
  --primary-black: #1a1a1e;      /* Text, headings, footer background */
  --primary-blue: #3358ef;       /* Primary buttons, links, accents */
  --secondary-yellow: #cbf84c;   /* Secondary accents, highlights */
  --tertiary-green: #1dc939;     /* Success states, positive indicators */
  --tertiary-red: #da0f0f;       /* Error states, warnings, negative indicators */
}
```

### Usage Guidelines

- **Primary Blue (#3358EF)**: Used for main buttons, links, and key UI elements
- **Secondary Yellow (#CBF84C)**: Used for highlights, hover states, and secondary accents
- **Background Gradient**: Linear gradient from blue to dark blue, used on major sections

```css
background: linear-gradient(135deg, #3358ef 0%, #1a1a1e 100%);
```

## Typography

The site uses three main font families, each with specific purposes:

### 1. Montserrat (Primary Font)
- Used for headlines, navigation, and UI elements
- Various weights from 300 to 800
- Example usage:

```css
.h1-montserrat {
  font-family: var(--montserrat);
  font-weight: 700;
  font-size: 48px;
  line-height: 1.2;
}
```

### 2. Roboto (Secondary Font)
- Used for body text, buttons, and form elements
- Weights primarily 400 and 500
- Example usage:

```css
.body-text {
  font-family: var(--roboto);
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
}
```

### 3. Merriweather (Accent Font)
- Used for certain headings and pull quotes
- Primarily in 400 weight
- Example usage:

```css
.accent-heading {
  font-family: Merriweather, serif;
  font-weight: 400;
  font-style: italic;
}
```

### Typography Scale

| Element            | Font Family | Weight | Size (Desktop) | Size (Mobile) | Line Height |
|--------------------|-------------|--------|----------------|---------------|-------------|
| H1                 | Montserrat  | 700    | 48px           | 32px          | 1.2         |
| H2                 | Montserrat  | 600    | 36px           | 28px          | 1.3         |
| H3                 | Montserrat  | 600    | 24px           | 20px          | 1.4         |
| H4                 | Montserrat  | 500    | 20px           | 18px          | 1.4         |
| Body Text          | Roboto      | 400    | 16px           | 16px          | 1.5         |
| Small Text         | Roboto      | 400    | 14px           | 14px          | 1.5         |
| Button Text        | Montserrat  | 500    | 16px           | 16px          | 1           |
| Navigation Links   | Montserrat  | 500    | 18px           | 16px          | 1           |
| Footer Links       | Montserrat  | 400    | 14px           | 14px          | 1.4         |

## Component Styling

### Buttons

The site uses a consistent button system:

#### Primary Button
```css
.button-primary {
  background-color: var(--primary-blue);
  color: var(--primary-white);
  font-family: var(--montserrat);
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  transition: background-color 0.3s ease;
}

.button-primary:hover {
  background-color: #1c3dd7; /* Darker blue */
}
```

#### Secondary Button
```css
.button-secondary {
  background-color: var(--secondary-yellow);
  color: var(--primary-black);
  font-family: var(--montserrat);
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  transition: background-color 0.3s ease;
}

.button-secondary:hover {
  background-color: #b2de30; /* Darker yellow */
}
```

#### Text Button
```css
.button-text {
  background: none;
  color: var(--primary-blue);
  font-family: var(--montserrat);
  font-weight: 500;
  padding: 8px 16px;
  border: none;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.button-text:hover {
  color: #1c3dd7; /* Darker blue */
}
```

### Cards

Article cards follow a consistent structure:

```css
.article-card {
  background-color: var(--primary-white);
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

.article-image-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.article-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.article-title {
  font-family: var(--montserrat);
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 8px;
  color: var(--primary-black);
}

.article-excerpt {
  font-family: var(--roboto);
  font-size: 16px;
  color: #4A4A4A;
  margin-bottom: 16px;
  flex-grow: 1;
}

.article-metadata {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #757575;
}
```

### Navigation

The navigation components use consistent styling:

```css
.navbar {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
}

.navbar-white {
  color: var(--primary-white);
}

.navbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-brand {
  display: block;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  font-family: var(--montserrat);
  font-weight: 500;
  font-size: 18px;
  margin: 0 16px;
  text-decoration: none;
  color: inherit;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background-color: var(--primary-blue);
  transition: width 0.3s ease;
}

.navbar-white .nav-link::after {
  background-color: var(--secondary-yellow);
}

.nav-link:hover::after {
  width: 100%;
}
```

## CSS Organization

The CSS is organized into several files, each with a specific purpose:

### 1. Base Styles
- **normalize.css**: Resets browser defaults for consistent rendering
- **webflow.css**: Core framework styles (from Webflow)

### 2. Global Styles
- **debtcat.webflow.css**: Site-wide styling, variables, and common components

### 3. Component-Specific Styles
- **footer.css**: Footer-specific styling
- **menu-icon.css**: Mobile menu icon animation

### 4. Page-Specific Styles
- **articles.css**: Styling for the articles listing page
- **article-detail.css**: Styling for individual article pages
- **static-articles.css**: Styling for static article templates

### CSS Loading Order

For optimal rendering, CSS files should be loaded in this order:

```html
<link href="/css/normalize.css" rel="stylesheet" type="text/css">
<link href="/css/webflow.css" rel="stylesheet" type="text/css">
<link href="/css/debtcat.webflow.css" rel="stylesheet" type="text/css">
<!-- Page-specific CSS files -->
<link href="/css/article-detail.css" rel="stylesheet" type="text/css">
```

## Responsive Design

The site uses a mobile-first approach with three main breakpoints:

### Breakpoints
- **Desktop**: 992px and above
- **Tablet**: 768px to 991px
- **Mobile**: 767px and below
- **Small Mobile**: 479px and below

### Example Media Queries

```css
/* Base styles (mobile first) */
.container {
  padding: 16px;
}

/* Tablet styles */
@media screen and (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop styles */
@media screen and (min-width: 992px) {
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Mobile Navigation

On mobile devices (screen width below 992px):
- The navigation menu converts to a hamburger menu
- The menu slides in from the top when activated
- Menu button animates from hamburger to X

```css
@media screen and (max-width: 991px) {
  .nav-menu {
    position: absolute;
    top: 80px;
    left: 0;
    width: 100%;
    flex-direction: column;
    background-color: var(--primary-white);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px 0;
    transform: translateY(-150%);
    transition: transform 0.3s ease;
    z-index: 10;
  }
  
  .nav-menu.active {
    transform: translateY(0);
  }
  
  .nav-link {
    padding: 12px 24px;
    margin: 0;
    width: 100%;
    text-align: center;
  }
  
  .menu-button {
    display: flex;
  }
}
```

## Common UI Patterns

### 1. Background Gradient

The site uses a consistent gradient background for main sections:

```css
.gradient-background {
  background: linear-gradient(135deg, #3358ef 0%, #1a1a1e 100%);
  color: var(--primary-white);
}
```

### 2. Content Containers

Content containers provide consistent spacing:

```css
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

@media screen and (max-width: 767px) {
  .content-container {
    padding: 24px 16px;
  }
}
```

### 3. Section Spacing

Sections follow consistent vertical spacing:

```css
.section {
  margin-bottom: 64px;
}

@media screen and (max-width: 767px) {
  .section {
    margin-bottom: 48px;
  }
}
```

## Image Guidelines

### 1. Article Featured Images
- **Aspect Ratio**: 16:9 (responsive container)
- **Resolution**: At least 800px width
- **Format**: JPEG or PNG
- **Naming Convention**: descriptive-name-p-800.jpg

### 2. Icons
- **Format**: SVG preferred
- **Colors**: Use currentColor for monochrome icons
- **Size**: Typically 24px × 24px

### 3. Logo Versions
- **Black Logo**: /images/debtcat-logo-black.svg
- **White Logo**: /images/debtcat-logo-inverse.svg
- **Favicon**: /images/favicon.png
- **Apple Touch Icon**: /images/webclip.png

## Adding New Styles

When adding new styles to the site:

1. **Follow Existing Patterns**:
   - Use established colors from the palette
   - Follow typography guidelines
   - Maintain consistent spacing

2. **Component-Based Approach**:
   - Create modular, reusable components
   - Document component structure
   - Test responsiveness

3. **CSS Organization**:
   - Add page-specific styles to the appropriate CSS file
   - Global styles should go in debtcat.webflow.css
   - Component styles should be modular and well-documented

4. **Naming Conventions**:
   - Use descriptive class names
   - Follow existing naming patterns
   - Avoid overly generic names

## Accessibility Considerations

For all visual elements:

1. **Color Contrast**:
   - Maintain 4.5:1 contrast ratio for normal text
   - 3:1 contrast ratio for large text
   - Test with a contrast checker

2. **Text Sizes**:
   - Body text no smaller than 16px
   - Small text no smaller than 14px

3. **Focus States**:
   - All interactive elements have visible focus states
   - Do not remove outline without replacement

4. **ARIA Attributes**:
   - Include appropriate ARIA roles and labels
   - Ensure all interactive elements are keyboard accessible
