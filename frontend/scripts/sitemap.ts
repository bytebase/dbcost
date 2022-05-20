import { writeFileSync } from "fs";
import { resolve } from "path";

const baseUrl = "https://dbcost.com";

// TODO (zilong): add more route with query params
const routes: string[] = ["", "provider/AWS", "provider/GCP"];

const _now = new Date();
const now = `${_now.getFullYear()}-${_now.getMonth()}-${_now.getDate()}`;

const getXMLTag = (url: string) =>
  `<url><loc>${url}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq></url>`;

const generateSitemap = async () => {
  const routeXMLTags: string[] = [];

  for (const route of routes) {
    const xmlTag = getXMLTag([baseUrl, route].join("/"));
    routeXMLTags.push(xmlTag);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${routeXMLTags.join("\n")}
    </urlset>`;

  writeFileSync(resolve(__dirname, "../public/sitemap.xml"), xml);
};

export default generateSitemap;
