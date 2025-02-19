const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Directories – adjust these paths as needed
const sourceDir = path.join(__dirname, 'articles'); // messy source articles
const outputDir = path.join(__dirname, 'articles-static');
const templatePath = path.join(__dirname, 'template.html'); // your static template

// Read the static template HTML
const templateHTML = fs.readFileSync(templatePath, 'utf8');

// Define the image mapping manually (provided by you)
const imageMapping = {
  "CFPB Rule Means No More Medical Debt on Credit Scores": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/6781dadcc718a4055d268e20_ds.png",
  "California Removes Medical Debt from Credit Reports in 2025": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/6773394a803012bd95e5889f_LwuhTX7QSaeIvz1cb2107Q.webp",
  "Debt Collector vs. Credit Bureau Disputes: Understanding the Difference": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/6709b18de51097dd83363b3f_pexels-rdne-9034783.jpg",
  "Debt Collectors Beware: How the FDCPA and CFPB Protect Your Wallet": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/66ea5592e9931bf9ccea03e1_pexels-sora-shimazaki-5668772.jpg",
  "Debt Consolidation Secrets They Don't Want You to Know": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/6737f6be73b190ea1ef12dfa_pexels-karolina-grabowska-4968630.jpg",
  "Debt Negotiation: An Insider's Guide to Dealing with Collectors": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/66ea55245ec37da493d264bc_man-talking-on-cellphone.jpg",
  "Old Debt Calls? How the Statute of Limitations Protects You": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/67018b4b5ebcffcb9074f614_hourglass-time-flies.jpg",
  "What Really Happens When You Ignore Debt?": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/66fc92b55e6364b299af8452_pexels-alex-green-5699865.jpg",
  "What to Do When a Debt Collector Contacts You": "https://cdn.prod.website-files.com/66567a81d5c1745978fb58d6/66e3914d3c8f8eea6a0ac927_pexels-karolina-grabowska-7877116.jpg"
};

// Update image paths inside article content so they work relative to the static output folder.
function updateImagePaths(htmlContent) {
  const $ = cheerio.load(htmlContent);
  $('img').each((i, el) => {
    let src = $(el).attr('src');
    if (src && src.startsWith('/images/')) {
      $(el).attr('src', `..${src}`);
    }
  });
  return $.html();
}

/**
 * Build the new static page by injecting title and body into the template.
 */
function buildStaticPage(articleData) {
  // Update image paths within the article body
  articleData.body = updateImagePaths(articleData.body);
  const $page = cheerio.load(templateHTML);
  
  // Update the page title and meta title
  $page('title').text(`DebtCat | ${articleData.title}`);
  
  // Update the main heading (assumes it uses .h1-roboto)
  $page('h1.h1-roboto').text(articleData.title);
  
  // Insert the article body into the designated container
  $page('.article-body').html(articleData.body);
  
  // Update the main image using the mapping from CSV data if available
  if (imageMapping[articleData.title]) {
    $page('.article-image-container img').attr('src', imageMapping[articleData.title]);
  }
  
  return $page.html();
}

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Process each HTML file in the source directory
fs.readdir(sourceDir, (err, files) => {
  if (err) throw err;
  
  files.filter(file => file.endsWith('.html')).forEach(file => {
    const filePath = path.join(sourceDir, file);
    const articleHTML = fs.readFileSync(filePath, 'utf8');
    const $article = cheerio.load(articleHTML);
    
    // Extract article title and body.
    const title = $article('h1').first().text().trim() || 'Untitled';
    const body = $article('.article-body').html() || $article('body').html();
    
    const articleData = { title, body };
    const staticPageHTML = buildStaticPage(articleData);
    
    // Write the new static file (using the same filename)
    const outputPath = path.join(outputDir, file);
    fs.writeFileSync(outputPath, staticPageHTML, 'utf8');
    console.log(`Migrated ${file} to static page.`);
  });
});