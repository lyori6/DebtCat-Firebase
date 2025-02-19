
// Asset path configuration
const config = {
  // Base paths
  paths: {
    images: '/images',
    articles: '/articles-static',
    css: '/css',
    data: '/data'
  },

  // Article mappings
  articles: {
    'CFPB Rule Means No More Medical Debt on Credit Scores': {
      filename: 'cfpb-medical.html',
      image: 'medical-debt.jpg'
    },
    'California Removes Medical Debt from Credit Reports in 2025': {
      filename: 'ca25.html',
      image: 'california-medical-debt.jpg'
    },
    'Debt Collector vs. Credit Bureau': {
      filename: 'collector-vs-bureau.html',
      image: 'debt-collector.jpg'
    },
    'Debt Collectors Beware': {
      filename: 'Collectors-Beware.html',
      image: 'debt-collectors-beware.jpg'
    },
    'Debt Consolidation Secrets': {
      filename: 'Debt-Consolidation.html',
      image: 'debt-consolidation.jpg'
    },
    'Debt Negotiation: An Insider\'s Guide': {
      filename: 'insider-guide.html',
      image: 'debt-negotiation.jpg'
    },
    'Old Debt Calls?': {
      filename: 'old-debt.html',
      image: 'old-debt.jpg'
    },
    'What Really Happens When You Ignore Debt?': {
      filename: 'ignore-debt.html',
      image: 'ignore-debt.jpg'
    },
    'What to Do When a Debt Collector Contacts You': {
      filename: 'collector-contact.html',
      image: 'debt-collector-contact.jpg'
    }
  },

  // Default values
  defaults: {
    placeholderImage: '800x450.svg',
    category: 'General',
    articleTitle: 'Untitled Article',
    summary: 'No summary available'
  }
};

// Initialize config
console.log('Initializing config.js');
window.config = config;
console.log('Config initialized successfully:', { 
  paths: config.paths,
  articleCount: Object.keys(config.articles).length 
});
