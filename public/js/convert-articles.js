// Function to convert article content to use the new template
async function convertArticle(article) {
  try {
    // Read the template
    const templateResponse = await fetch('/articles/template.html');
    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.status}`);
    }
    let template = await templateResponse.text();

    // Replace template variables with article data
    template = template.replace(/{{TITLE}}/g, article.Name);
    template = template.replace(/{{DESCRIPTION}}/g, article.Summary);
    template = template.replace(/{{CATEGORY}}/g, article.Category);
    template = template.replace(/{{DATE}}/g, new Date(article['Published Date']).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    template = template.replace(/{{AUTHOR}}/g, article.Author || 'Team DebtCat');
    
    // Map article titles to their images
    const imageMap = {
      'CFPB Rule Means No More Medical Debt on Credit Scores': 'medical-debt.jpg',
      'California Removes Medical Debt from Credit Reports in 2025': 'california-medical-debt.jpg',
      'Debt Collector vs. Credit Bureau': 'debt-collector.jpg',
      'Debt Collectors Beware': 'debt-collectors-beware.jpg',
      'Debt Consolidation Secrets They Don\'t Want You to Know': 'debt-consolidation.jpg',
      'Debt Negotiation': 'debt-negotiation.jpg',
      'Old Debt Calls?': 'old-debt.jpg',
      'What Really Happens When You Ignore Debt?': 'ignore-debt.jpg',
      'What to Do When a Debt Collector Contacts You': 'debt-collector-contact.jpg'
    };

    // Get image filename or use default
    const imageFilename = imageMap[article.Name] || '800x450.svg';
    template = template.replace(/{{IMAGE}}/g, imageFilename);

    // Replace content
    template = template.replace(/{{CONTENT}}/g, article.Content);

    // Generate URL-friendly filename
    const filename = article.Name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '.html';

    return {
      filename,
      content: template
    };
  } catch (error) {
    console.error('Error converting article:', error);
    return null;
  }
}

// Function to fetch and convert all articles
async function convertAllArticles() {
  try {
    // Fetch articles CSV
    const response = await fetch('/data/DebtCat - Articles.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    const csvText = await response.text();
    
    // Parse CSV
    const rows = csvText.split('\n').filter(row => row.trim());
    const headers = rows[0].split(',').map(header => header.trim());
    
    // Convert each article
    const articles = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      const article = {};
      headers.forEach((header, index) => {
        article[header] = values[index]?.trim() || '';
      });
      
      const converted = await convertArticle(article);
      if (converted) {
        articles.push(converted);
      }
    }

    return articles;
  } catch (error) {
    console.error('Error converting articles:', error);
    return [];
  }
}

// Execute conversion
convertAllArticles().then(articles => {
  console.log('Converted articles:', articles);
  // Here you would typically save the files, but in this browser context
  // we'll just log them. The actual file saving would be done server-side.
});
