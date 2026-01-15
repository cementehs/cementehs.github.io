// 自动更新sitemap的lastmod日期
const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];

let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
sitemapContent = sitemapContent.replace(
  /<lastmod>.*?<\/lastmod>/g,
  `<lastmod>${today}</lastmod>`
);

fs.writeFileSync(sitemapPath, sitemapContent);
console.log('Sitemap updated:', today);