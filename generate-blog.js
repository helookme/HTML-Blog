const fs = require('fs');
const path = require('path');

// ========== 请改成你自己的域名 ==========
const SITE_URL = 'https://test.578113.xyz';

const blogDir = path.join(__dirname, 'content', 'blog');
const blogJsonFile = path.join(__dirname, 'blog.json');
const rssFile = path.join(__dirname, 'rss.xml');
const sitemapFile = path.join(__dirname, 'sitemap.xml');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const fm = match[1];
  const data = {};
  const titleMatch = fm.match(/title:\s*["']?(.+?)["']?\s*\n/);
  const pubMatch = fm.match(/published:\s*["']?(.+?)["']?\s*\n/);
  const descMatch = fm.match(/description:\s*["']?(.+?)["']?\s*\n/);
  const catMatch = fm.match(/category:\s*["']?(.+?)["']?\s*\n/);
  const draftMatch = fm.match(/draft:\s*(true|false)/);
  const tagsMatch = fm.match(/tags:\s*\[([^\]]+)\]/);
  if (tagsMatch) {
    data.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
  } else {
    const tagsLine = fm.match(/tags:\s*(.+)/);
    if (tagsLine) data.tags = tagsLine[1].split(',').map(t => t.trim());
  }
  if (titleMatch) data.title = titleMatch[1].trim();
  if (pubMatch) data.published = pubMatch[1].trim();
  if (descMatch) data.description = descMatch[1].trim();
  if (catMatch) data.category = catMatch[1].trim();
  if (draftMatch) data.draft = draftMatch[1] === 'true';
  return data;
}

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
const posts = [];

files.forEach(file => {
  const fullPath = path.join(blogDir, file);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const fm = parseFrontmatter(raw);
  if (fm.draft) return;
  const slug = file.replace(/\.md$/, '');
  const body = raw.replace(/^---[\s\S]*?---\n*/, '');
  posts.push({
    slug,
    file: `content/blog/${file}`,
    title: fm.title || slug,
    published: fm.published || '',
    description: fm.description || '',
    tags: fm.tags || [],
    category: fm.category || '',
    content: body
  });
});

posts.sort((a, b) => (b.published || '').localeCompare(a.published || ''));

// 生成 blog.json
fs.writeFileSync(blogJsonFile, JSON.stringify(posts, null, 2));
console.log('blog.json 已生成');

// ========== 生成 RSS 2.0 ==========
const rssItems = posts.map(post => {
  const pubDate = post.published ? new Date(post.published + 'T00:00:00+08:00').toUTCString() : '';
  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/reader.html?slug=${encodeURIComponent(post.slug)}</link>
      <description>${escapeXml(post.description || '')}</description>
      <pubDate>${pubDate}</pubDate>
      <guid>${SITE_URL}/reader.html?slug=${encodeURIComponent(post.slug)}</guid>
    </item>`;
}).join('\n');

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AkiNard Blog</title>
    <link>${SITE_URL}</link>
    <description>世间万物不及你. 这里是 @SkyCeria 的个人博客。</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

fs.writeFileSync(rssFile, rssFeed);
console.log('rss.xml 已生成');

// ========== 生成 sitemap.xml ==========
const sitemapItems = posts.map(post => {
  const lastmod = post.published || '';
  return `  <url>
    <loc>${SITE_URL}/reader.html?slug=${encodeURIComponent(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog.html</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/friends.html</loc>
    <priority>0.5</priority>
  </url>
${sitemapItems}
</urlset>`;

fs.writeFileSync(sitemapFile, sitemap);
console.log('sitemap.xml 已生成');

function escapeXml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&apos;');
}

// ========== 写入部署信息（Cloudflare Pages 提供 CF_PAGES_COMMIT_SHA） ==========
const commitInfo = {
  sha: process.env.CF_PAGES_COMMIT_SHA || ''
};
fs.writeFileSync(path.join(__dirname, 'commit.json'), JSON.stringify(commitInfo));
console.log('commit.json 已生成');