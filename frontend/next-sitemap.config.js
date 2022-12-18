/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.dbcost.com",
  generateRobotsTxt: true,
  // Currently dbcost is using SSG to pre-build all pages, and the pages count is
  // not that large, so we can just put the sitemap in one file.
  sitemapSize: 5000,
};
