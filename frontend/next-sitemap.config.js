/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.dbcost.com",
  generateRobotsTxt: true,
  // Currently dbcost will generate over 10,000 pages, so let's
  // split a huge sitemap into smaller pieces.
  sitemapSize: 5000,
};
