/**
 * Content sanitizer for article templates
 * Handles cleanup of converted content to ensure consistent formatting
 */

const sanitizeContent = (content) => {
  if (!content) return '';
  
  return content
    // Remove all Webflow-specific attributes and classes
    .replace(/\s*data-w-[^=]*="[^"]*"/g, '')
    .replace(/\s*class="w-[^"]*"/g, '')
    .replace(/\s*wf-[^=]*="[^"]*"/g, '')
    
    // Fix malformed CDN image tags
    .replace(
      /<img(?:http|https):\/\/cdn\.prod\.website-files\.com[^>]+>/g,
      (match) => {
        const imageId = match.match(/([^\/]+?)(?:%[0-9A-F]{2})*\.(?:png|jpg|jpeg|gif)$/i)?.[1];
        return imageId ? 
          `<img src="/images/${imageId}" loading="lazy" alt="" class="article-image">` :
          '';
      }
    )
    
    // Fix malformed figure tags
    .replace(
      /<figure(?:w-richtext-figure-type-image\s+w-richtext-align-center"|[^>]*)>/g,
      '<figure class="article-figure">'
    )
    
    // Fix malformed div wrappers and remove unnecessary ones
    .replace(/<div(?:w-richtext-media-wrapper"|[^>]*)>\s*<figure/g, '<figure')
    .replace(/<\/figure>\s*<\/div>/g, '</figure>')
    .replace(/<div[^>]*>\s*(<(?:p|h[1-6]|ul|ol|blockquote)[^>]*>)/g, '$1')
    .replace(/(<\/(?:p|h[1-6]|ul|ol|blockquote)>)\s*<\/div>/g, '$1')
    
    // Remove empty attributes and divs
    .replace(/\s+(?:id|class|style)=""/g, '')
    .replace(/<div>\s*<\/div>/g, '')
    
    // Fix heading hierarchy and classes
    .replace(/<h[45]/g, '<h3')
    .replace(/<\/h[45]>/g, '</h3>')
    .replace(/<h2(?:\s+[^>]*)?>/g, '<h2 class="h2-roboto">')
    .replace(/<h3(?:\s+[^>]*)?>/g, '<h3 class="h3-roboto">')
    
    // Remove any remaining heading classes that might conflict
    .replace(/class="[^"]*heading[^"]*"/g, '')
    
    // Standardize list and paragraph formatting
    .replace(/<ul(?:\s+[^>]*)?>/g, '<ul class="article-list">')
    .replace(/<ol(?:\s+[^>]*)?>/g, '<ol class="article-list">')
    .replace(/<li(?:\s+[^>]*)?>/g, '<li class="article-list-item">')
    .replace(/<p(?:\s+[^>]*)?>/g, '<p class="article-paragraph">')
    
    // Fix blockquote formatting
    .replace(/<blockquote(?:\s+[^>]*)?>/g, '<blockquote class="article-quote">')
    
    // Clean up whitespace and empty elements
    .replace(/\n\s*\n/g, '\n')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\s+</g, '<')
    .replace(/>\s+/g, '>')
    .trim();
};

// Add to window for template usage
window.sanitizeContent = sanitizeContent;
