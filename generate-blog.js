const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'content', 'blog');
const outputFile = path.join(__dirname, 'blog.json');

// 解析 Markdown 文件头部的 YAML 信息
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

  // tags 支持两种写法：tags: [a, b, c] 或 tags: a, b, c
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
  if (fm.draft) return;  // 跳过草稿

  const slug = file.replace(/\.md$/, '');
  const body = raw.replace(/^---[\s\S]*?---\n*/, '');  // 去掉 frontmatter 得到正文

  posts.push({
    slug,
    file: `content/blog/${file}`,
    title: fm.title || slug,
    published: fm.published || '',
    description: fm.description || '',
    tags: fm.tags || [],
    category: fm.category || '',
    content: body    // 正文内容，用于搜索
  });
});

// 按发布日期倒序排列
posts.sort((a, b) => (b.published || '').localeCompare(a.published || ''));

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log('blog.json 已生成');