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
      url: '/articles-static/cfpb-medical.html',
      image: 'medical-debt.jpg'
    },
    'California Removes Medical Debt from Credit Reports in 2025': {
      filename: 'ca25.html',
      url: '/articles-static/ca25.html', 
      image: 'california-medical-debt.jpg'
    },
    'Debt Collector vs. Credit Bureau Disputes: Understanding the Difference': {
      filename: 'collector-vs-bureau.html',
      url: '/articles-static/collector-vs-bureau.html',
      image: 'debt-collector.jpg'
    },
    'Debt Collectors Beware: How the FDCPA and CFPB Protect Your Wallet': {
      filename: 'collectors-beware.html',
      url: '/articles-static/collectors-beware.html',
      image: 'debt-collectors-beware.jpg'
    },
    'Debt Consolidation Secrets They Don\'t Want You to Know': {
      filename: 'debt-consolidation.html', 
      url: '/articles-static/debt-consolidation.html',
      image: 'debt-consolidation.jpg'
    },
    'Debt Negotiation: An Insider\'s Guide to Dealing with Collectors': {
      filename: 'insider-guide.html',
      url: '/articles-static/insider-guide.html',
      image: 'debt-negotiation.jpg'
    },
    'Old Debt Calls? How the Statute of Limitations Protects You': {
      filename: 'old-debt.html',
      url: '/articles-static/old-debt.html',
      image: 'old-debt.jpg'
    },
    'What Really Happens When You Ignore Debt?': {
      filename: 'ignore-debt.html',
      url: '/articles-static/ignore-debt.html',
      image: 'ignore-debt.jpg'
    },
    'What to Do When a Debt Collector Contacts You': {
      filename: 'collector-contact.html',
      url: '/articles-static/collector-contact.html',
      image: 'debt-collector-contact.jpg'
    }
  },
 

  // Default values
  defaults: {
    placeholderImage: '800x450.svg',
    category: 'General',
    articleTitle: 'Untitled Article',
    summary: 'No summary available',
    author: 'Team DebtCat'
  }
};

// Debug logging utility for Node.js
const debugLog = {
  error: function(message, details = {}) {
    console.error(`[ERROR] ${message}`, details);
    this.appendToLog('ERROR', message, details);
  },
  
  warn: function(message, details = {}) {
    console.warn(`[WARNING] ${message}`, details);
    this.appendToLog('WARNING', message, details);
  },
  
  info: function(message, details = {}) {
    console.info(`[INFO] ${message}`, details);
    this.appendToLog('INFO', message, details);
  },
  
  appendToLog: function(level, message, details) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level}: ${message}\n${JSON.stringify(details, null, 2)}\n\n`;
    
    try {
      fs.appendFileSync('debug_log.md', logEntry);
    } catch (error) {
      console.error('Error writing to debug log:', error);
    }
  }
};

module.exports = { config, debugLog };
