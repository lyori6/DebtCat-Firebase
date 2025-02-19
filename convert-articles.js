const fs = require('fs');
const path = require('path');
const { config, debugLog } = require('./convert-articles-config.js');

// Import sanitization utilities
const sanitizer = require('./public/js/content-sanitizer.js');

// Function to parse CSV properly handling quoted fields
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

debugLog.info('Starting article conversion process');

try {
  // Read the template file
  const templatePath = path.join(__dirname, 'public', 'articles', 'template.html');
  const template = fs.readFileSync(templatePath, 'utf8');
  debugLog.info('Template loaded successfully', { path: templatePath });

  // Read the CSV file
  const csvPath = path.join(__dirname, 'public', 'data', 'DebtCat - Articles.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  debugLog.info('CSV file loaded successfully', { path: csvPath });

  // Parse CSV (using our custom parser)
  const rows = csvContent.split('\n')
    .filter(row => row.trim())
    .map(row => row.replace(/\r$/, '')); // Handle Windows line endings
  const headers = parseCSVRow(rows[0]);

  debugLog.info('CSV parsing complete', { 
    rowCount: rows.length,
    headers: headers 
  });

  // Process each article
  rows.slice(1).forEach(row => {
    const values = parseCSVRow(row);
    const article = {};
    headers.forEach((header, index) => {
      article[header.trim()] = values[index]?.trim() || '';
    });

    // Get article mapping from config
    const mapping = config.articles[article.Name];
    
    if (!mapping) {
      debugLog.warn('No article mapping found', { 
        articleTitle: article.Name,
        availableMappings: Object.keys(config.articles)
      });
    }

    // Get image and filename from map or use defaults
    const imageFilename = mapping?.image || config.defaults.placeholderImage;
    
    // Get filename from map or generate URL-friendly version
    const filename = mapping?.filename || article.Name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '.html';

    // Format date nicely
    const publishDate = new Date(article['Published Date']);
    const formattedDate = publishDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Process article content using sanitizer
    const processed = sanitizer.processArticleContent({
      Title: article.Name,
      Description: article.Summary,
      Category: article.Category,
      Date: article['Published Date'],
      Author: article.Author,
      Image: imageFilename,
      Body: article.Body
    });

    // Replace template variables with sanitized content
    let content = template
      .replace(/{{TITLE}}/g, processed.title || config.defaults.articleTitle)
      .replace(/{{DESCRIPTION}}/g, processed.description || config.defaults.summary)
      .replace(/{{CATEGORY}}/g, processed.category || config.defaults.category)
      .replace(/{{DATE}}/g, formattedDate)
      .replace(/{{AUTHOR}}/g, processed.author || config.defaults.author)
      .replace(/{{IMAGE}}/g, processed.image || imageFilename)
      .replace(/{{CONTENT}}/g, processed.content || '');

    // Write the file
    const outputPath = path.join(__dirname, 'public', 'articles', filename);
    fs.writeFileSync(outputPath, content);
    
    debugLog.info('Article created successfully', {
      filename,
      title: article.Name,
      image: imageFilename,
      category: article.Category,
      date: formattedDate
    });
  });

  debugLog.info('Article conversion complete!', {
    totalArticles: rows.length - 1
  });

} catch (error) {
  debugLog.error('Error during article conversion', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
}
