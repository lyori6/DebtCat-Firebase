// Default configuration when config.js is not loaded
const defaultConfig = {
  paths: {
    data: '/data',
    images: '/images',
    articles: '/articles'
  },
  defaults: {
    placeholderImage: '800x450.svg',
    articleTitle: 'Article Title',
    category: 'General',
    summary: 'Article summary not available'
  },
  articles: {}
};

// Get active config or fall back to defaults
const activeConfig = window.config || defaultConfig;

// Function to parse CSV data properly handling quoted fields
function parseCSVRow(row) {
  const values = [];
  let currentValue = '';
  let withinQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      withinQuotes = !withinQuotes;
      continue;
    }
    
    if (char === ',' && !withinQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }
    
    currentValue += char;
  }
  values.push(currentValue.trim());
  return values;
}

async function fetchAndParseArticles() {
  try {
    console.log('Fetching articles CSV:', `${activeConfig.paths.data}/DebtCat - Articles.csv`);

    const response = await fetch(`${activeConfig.paths.data}/DebtCat - Articles.csv`);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log('CSV fetched successfully, length:', csvText.length);
    
    // Split CSV into rows and parse header
    const rows = csvText.split('\n').filter(row => row.trim());
    const headers = parseCSVRow(rows[0]);
    
    console.log('CSV headers parsed:', { headers, rowCount: rows.length });
    
    // Parse remaining rows into article objects
    const articles = rows.slice(1).map(row => {
      const values = parseCSVRow(row);
      const article = {};
      headers.forEach((header, index) => {
        // Handle missing values
        article[header.trim()] = values[index]?.trim() || '';
      });
      return article;
    });

    console.log('Articles parsed successfully:', {
      count: articles.length,
      firstArticle: articles[0]?.Name,
      lastArticle: articles[articles.length - 1]?.Name
    });

    // Sort articles by Published Date in descending order
    const sortedArticles = articles.sort((a, b) => {
      return new Date(b['Published Date']) - new Date(a['Published Date']);
    });

    console.log('Articles sorted by date:', {
      firstDate: sortedArticles[0]?.['Published Date'],
      lastDate: sortedArticles[sortedArticles.length - 1]?.['Published Date']
    });

    return sortedArticles;
  } catch (error) {
    console.error('Error fetching articles:', error.message);
    return [];
  }
}

// Function to create article card HTML
function createArticleCard(article) {
  // Get article mapping from config
  const articleMapping = activeConfig.articles?.[article.Name];
  
  if (!articleMapping && Object.keys(activeConfig.articles || {}).length > 0) {
    console.warn('No article mapping found:', {
      articleTitle: article.Name,
      availableMappings: Object.keys(activeConfig.articles)
    });
  }

  // Get image URL with fallback
  let imageUrl;
  if (article['Featured Image']) {
    // Check if it's a relative path starting with /
    if (article['Featured Image'].startsWith('/')) {
      imageUrl = article['Featured Image']; // Use relative path as-is
    } else if (article['Featured Image'].startsWith('http')) {
      imageUrl = article['Featured Image']; // Use full URL as-is
    } else {
      // Treat as local image name
      imageUrl = `${activeConfig.paths.images}/${article['Featured Image']}`;
    }
  } else if (articleMapping?.image) {
    // Use local image path
    imageUrl = `${activeConfig.paths.images}/${articleMapping.image}`;
  } else {
    // Use placeholder
    imageUrl = `${activeConfig.paths.images}/${activeConfig.defaults.placeholderImage}`;
  }
  
  // Format date nicely
  const publishDate = new Date(article['Published Date']);
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use mapped filename if available, otherwise generate URL-friendly filename
  const articleFilename = articleMapping?.filename || article.Name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '.html';

  // Log generated filenames for tracking
  if (!articleMapping?.filename) {
    console.warn('Using generated filename:', {
      articleTitle: article.Name,
      generatedFilename: articleFilename
    });
  }

  return `
    <div class="collection-item">
    <div class="article-card">
      <a href="${activeConfig.paths.articles}/${encodeURIComponent(articleFilename)}" class="article-card-link">
          <div class="image-container">
            <img src="${imageUrl}" 
                 loading="lazy" 
                 alt="${article.Name || activeConfig.defaults.articleTitle}" 
                 class="image"
                 onerror="this.onerror=null; this.classList.add('error'); this.src='${activeConfig.paths.images}/${activeConfig.defaults.placeholderImage}'; console.error('Image failed to load:', { originalSrc: '${imageUrl}', article: '${article.Name}', fallbackApplied: true });">
          </div>
          <div class="text-container">
            <div class="category-pill">
              <div class="text">${article.Category || activeConfig.defaults.category}</div>
            </div>
            <div class="card-title">${article.Name || activeConfig.defaults.articleTitle}</div>
            <div class="card-description">${article.Summary || activeConfig.defaults.summary}</div>
            <div class="publish-date">${formattedDate}</div>
            <div class="card-more">READ MORE</div>
          </div>
        </a>
      </div>
    </div>
  `;
}

// Function to render articles
async function renderArticles() {
  const articles = await fetchAndParseArticles();
  const container = document.querySelector('.collection-list');
  
  if (articles.length > 0) {
    console.log('Rendering articles:', { count: articles.length });
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Add articles
    articles.forEach(article => {
      container.innerHTML += createArticleCard(article);
    });
    
    // Remove empty state if it exists
    const emptyState = document.querySelector('.w-dyn-empty');
    if (emptyState) {
      emptyState.remove();
    }
  } else {
    console.warn('No articles to display');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing articles.js');
  
  // Only render articles if we're on the articles page
  const collectionList = document.querySelector('.collection-list');
  if (collectionList) {
    console.log('CSV path:', `${activeConfig.paths.data}/DebtCat - Articles.csv`);
    
    // Initialize articles page
    renderArticles().catch(error => {
      console.error('Failed to render articles:', error.message);
    });
  }

  console.log('Articles initialization complete');
});
