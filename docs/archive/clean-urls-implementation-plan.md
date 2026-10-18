# Clean URLs Implementation Plan

## Context

We want to implement clean URLs (without .html extensions) in our Firebase-hosted website. This is a best practice that:
- Makes URLs more user-friendly
- Improves SEO
- Hides implementation details
- Follows modern web standards

## Current Setup

1. File Structure:
   - All HTML files are in the `public/` directory with `.html` extensions
   - Special handling for `/articles/**` paths
   - Static assets (CSS, JS, images) in respective subdirectories

2. Current Firebase Configuration:
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

## Previous Attempts

We tried several approaches that didn't work:

1. First Attempt - Basic Catch-all:
```json
{
  "rewrites": [
    {
      "source": "**",
      "destination": "/$1.html"
    }
  ]
}
```
Issue: Too aggressive, caused conflicts with static assets

2. Second Attempt - Path Parameter:
```json
{
  "rewrites": [
    {
      "source": "/:page([^.]*)",
      "destination": "/:page.html"
    }
  ]
}
```
Issue: Firebase's URL rewrite syntax doesn't support this regex format

3. Third Attempt - Complex Pattern:
```json
{
  "rewrites": [
    {
      "source": "/**/[^.]*",
      "destination": "/$0.html"
    }
  ]
}
```
Issue: Pattern matching was incorrect

4. Fourth Attempt - SPA Style:
```json
{
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```
Issue: Treated everything as a single-page app route

## Proposed Solution

We need a two-phase approach:

### Phase 1: Proper URL Rewriting

1. Update firebase.json with correct rewrite rules:
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
      },
      {
        "source": "**",
        "destination": "/404.html"
      },
      {
        "source": "/*",
        "destination": "/$1.html"
      }
    ],
    "trailingSlash": false
  }
}
```

2. Add redirects for SEO:
```json
{
  "redirects": [
    {
      "source": "**/*.html",
      "destination": "/:splat",
      "type": 301
    }
  ]
}
```

### Phase 2: File System Restructuring

1. Create a script to:
   - Rename all .html files to remove extension
   - Update internal links
   - Handle nested directories

2. Update build process to:
   - Generate files without .html extension
   - Maintain proper linking

## Questions That Need Answers

1. Do we need to support both clean URLs and .html URLs during transition?
2. Are there any dynamic routes that need special handling?
3. Should we implement server-side rendering for better SEO?
4. Do we need to handle any legacy URLs or redirects?

## Implementation Steps

1. Backup current site
2. Implement new Firebase configuration
3. Test on staging environment
4. Monitor 404 errors
5. Implement redirects for any broken links
6. Update sitemap
7. Test all internal links
8. Deploy to production
9. Monitor analytics for any issues

## Rollback Plan

1. Keep backup of current configuration
2. Document all changes
3. Have immediate rollback procedure ready

## Success Metrics

1. No 404 errors
2. All internal links working
3. Search engines properly indexing
4. No impact on site performance

## Documentation Needed

1. Firebase Hosting URL rewrite documentation
2. Current site architecture documentation
3. SEO requirements
4. Analytics data for most accessed URLs

## Next Steps

1. Review this plan
2. Gather missing documentation
3. Create staging environment
4. Begin implementation in phases
5. Monitor and adjust as needed
