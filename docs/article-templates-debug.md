# DebtCat Firebase Article Templates - Technical Documentation

## Current Implementation (as of 2/16/2024)

### Template Structure
1. Core Components:
   - Header loads correctly via components.js
   - Gradient background uses container-body-inverse class
   - Template.html is self-contained (no config.js dependency)
   - Components.js handles header/footer with proper error handling

### Image System
1. Featured Article Images:
   ```html
   <img src="/images/{{IMAGE}}" 
        loading="lazy" 
        alt="{{TITLE}}" 
        class="article-image" 
        onerror="this.src='/images/800x450.svg'">
   ```
   - Direct /images/ path works correctly
   - Effective fallback to 800x450.svg
   - Clean HTML structure with proper attributes

2. Image Best Practices:
   - Store all images in /images/
   - Use consistent naming
   - Maintain original quality
   - Include proper alt text

### Content Sanitization
1. HTML Structure:
   - Semantic HTML with schema.org markup
   - Proper heading hierarchy (h1 -> h2 -> h3)
   - Clean, maintainable code
   - Valid HTML5 structure

2. Sanitization Rules:
   ```javascript
   // Core sanitization logic
   function sanitizeContent(content) {
     return content
       .replace(/\s*id=""/g, '') // Remove empty IDs
       .replace(/\s*class=""/g, '') // Remove empty classes
       .replace(/<p\s+id=>[^<]*<\/p>/g, '<p>$1</p>') // Fix empty attributes
       .replace(/\s+style=""/g, '') // Remove empty styles
       .replace(/\n\s*\n/g, '\n'); // Remove extra line breaks
   }
   ```

### CSS Structure
1. File Organization:
   - All CSS files referenced from /css/
   - Normalize.css for consistent rendering
   - Article-specific styles in article-detail.css

### Best Practices
1. Template Usage:
   - Keep template.html minimal and self-contained
   - Use semantic HTML structure
   - Follow heading hierarchy
   - Maintain proper image attributes

2. Content Creation:
   - Use semantic HTML
   - Include proper alt text
   - Follow heading hierarchy
   - Keep HTML structure clean

3. Error Handling:
   - Implement fallbacks
   - Log missing images
   - Validate formats
   - Monitor component loading

## Oracle Template Implementation Plan

### Goals
1. Create a simplified template that:
   - Maintains identical visual appearance
   - Ensures consistent text formatting throughout
   - Handles images correctly
   - Eliminates redundant styling
   - Removes legacy Webflow artifacts

### Implementation Steps

1. Template Structure:
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
       <main class="article-container">
         <article itemscope itemtype="http://schema.org/Article">
           <h1>{{TITLE}}</h1>
           <div class="article-meta">
             <span>{{CATEGORY}}</span>
             <span>{{DATE}}</span>
           </div>
           <img src="/images/{{IMAGE}}" alt="{{TITLE}}" class="article-image">
           <div class="article-content">
             {{CONTENT}}
           </div>
         </article>
       </main>
       <!-- Footer loaded via components.js -->
     </div>
     <script src="/js/components.js"></script>
   </body>
   </html>
   ```

2. Content Processing:
   ```javascript
   function processContent(content) {
     return content
       // Fix heading hierarchy
       .replace(/<h[45]/g, '<h3')
       .replace(/<\/h[45]>/g, '</h3>')
       
       // Standardize paragraph formatting
       .replace(/<p[^>]*>/g, '<p class="article-paragraph">')
       
       // Clean up lists
       .replace(/<ul[^>]*>/g, '<ul class="article-list">')
       .replace(/<ol[^>]*>/g, '<ol class="article-list">')
       .replace(/<li[^>]*>/g, '<li>')
       
       // Remove Webflow artifacts
       .replace(/\s*class="w-[^"]*"/g, '')
       .replace(/\s*data-w-[^=]*="[^"]*"/g, '')
       
       // Clean empty attributes
       .replace(/\s*(id|style|class)=""/g, '')
       
       // Fix spacing
       .replace(/\n\s*\n/g, '\n')
       .trim();
   }
   ```

3. CSS Cleanup:
   ```css
   /* article-detail.css */
   .article-container {
     max-width: 800px;
     margin: 0 auto;
     padding: 2rem;
   }
   
   .article-image {
     width: 100%;
     height: auto;
     margin: 2rem 0;
   }
   
   .article-paragraph {
     font-size: 16px;
     line-height: 1.6;
     margin: 1.5rem 0;
   }
   
   .article-list {
     margin: 1.5rem 0;
     padding-left: 2rem;
   }
   
   h1 { font-size: 2.5rem; margin: 2rem 0 1rem; }
   h2 { font-size: 2rem; margin: 2rem 0 1rem; }
   h3 { font-size: 1.5rem; margin: 1.5rem 0 1rem; }
   ```

4. Image Handling:
   - Keep current image system with fallback
   - Remove redundant srcset attributes
   - Maintain lazy loading
   - Use semantic figure tags where appropriate:
   ```html
   <figure class="article-figure">
     <img src="/images/{{IMAGE}}" 
          alt="{{TITLE}}" 
          class="article-image" 
          loading="lazy"
          onerror="this.src='/images/800x450.svg'">
   </figure>
   ```

### Migration Strategy
1. Create new template file (oracle-template.html)
2. Update content processing in convert-articles.js
3. Test with sample articles
4. Verify formatting consistency
5. Roll out to all articles

### Success Criteria
1. Visual consistency with current template
2. Consistent text formatting throughout articles
3. Proper image loading and fallbacks
4. Clean, minimal HTML structure
5. No Webflow artifacts
6. Reduced CSS complexity

## Next Steps
1. Testing:
   - Verify template with various content lengths
   - Test image fallback system
   - Validate schema.org markup
   - Check responsive behavior

2. Documentation:
   - Update conversion process docs
   - Document sanitization rules
   - Add template usage guide
   - Include best practices
