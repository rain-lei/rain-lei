const fs = require('fs');
const path = require('path');
const markdown = require('../markdown.js');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const checkOnly = process.argv.includes('--check');
const buildVersion = String(process.env.BUILD_VERSION || Date.now().toString(36))
  .replace(/[^a-zA-Z0-9_-]/g, '')
  .slice(0, 24);

const categories = {
  study: '学习',
  life: '生活',
  entertainment: '娱乐',
};
const categoryAliases = {
  product: 'study',
  knowledge: 'study',
  design: 'entertainment',
  tool: 'life',
  tools: 'life',
  '学习': 'study',
  '生活': 'life',
  '娱乐': 'entertainment',
  '工具': 'life',
  '知识': 'study',
};
const accents = new Set(['sunset', 'blue', 'green', 'cream', 'purple', 'orange']);
const accentAliases = { '橘光': 'orange' };
const staticFiles = [
  'index.html', 'article.html', 'admin.html', 'styles.css', 'motion.css',
  'friend-links.css', 'home.css', 'static-admin.css', 'app.js', 'article.js', 'markdown.js',
  'github.js', 'friend-links.js', 'friend-links.json',
];

function copyFile(relativePath) {
  const source = path.join(ROOT, relativePath);
  if (!fs.existsSync(source)) throw new Error(`缺少静态资源：${relativePath}`);
  const destination = path.join(DIST, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.cpSync(source, destination, { recursive: true });
}

function versionHtmlAssets(relativePath) {
  const destination = path.join(DIST, relativePath);
  let html = fs.readFileSync(destination, 'utf8');
  html = html.replace(
    /(\b(?:src|href)=")([^"?#]+\.(?:js|css))(?:\?[^"#]*)?(")/g,
    (match, prefix, assetPath, suffix) =>
      /^(?:https?:)?\/\//i.test(assetPath) ? match : `${prefix}${assetPath}?v=${buildVersion}${suffix}`
  );
  fs.writeFileSync(destination, html, 'utf8');
}

function dateForDisplay(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!match) return raw || '未标注日期';
  return `${match[1]}.${match[2].padStart(2, '0')}.${match[3].padStart(2, '0')}`;
}

function sortableDate(value) {
  return dateForDisplay(value).replace(/\D/g, '').padEnd(8, '0');
}

function slugFromFilename(filename) {
  return path.basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'post';
}

function removeDuplicatedTitle(body, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return body.replace(new RegExp(`^#\\s+${escaped}\\s*(?:\\n|$)`, 'i'), '').trim();
}

function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) throw new Error('缺少 content/posts 目录。');
  const ids = new Set();
  const posts = fs.readdirSync(POSTS_DIR)
    .filter((file) => file.toLowerCase().endsWith('.md'))
    .sort()
    .map((file) => {
      const source = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const parsed = markdown.parseMarkdownDocument(source, file);
      const meta = parsed.meta || {};
      const id = String(meta.id || slugFromFilename(file)).trim();
      if (ids.has(id)) throw new Error(`文章 id 重复：${id}`);
      ids.add(id);

      const rawCategory = String(meta.category || 'study').trim().toLowerCase();
      const category = categories[rawCategory] ? rawCategory : categoryAliases[rawCategory] || 'study';
      const accentValue = String(meta.accent || 'sunset').trim();
      const accent = accents.has(accentValue) ? accentValue : accentAliases[accentValue] || 'sunset';
      const bodyMarkdown = removeDuplicatedTitle(parsed.body, parsed.title);
      const title = parsed.title || slugFromFilename(file);
      const excerpt = parsed.excerpt || markdown.extractMarkdownExcerpt(bodyMarkdown) || '暂无摘要。';

      return {
        id,
        category,
        categoryLabel: categories[category],
        date: dateForDisplay(meta.date),
        read: markdown.estimateReadTime(bodyMarkdown, { locale: 'en' }),
        title,
        excerpt,
        accent,
        bodyMarkdown,
        featured: meta.featured === true,
        status: String(meta.status || 'published').toLowerCase(),
        _sortDate: sortableDate(meta.date),
      };
    })
    .filter((post) => post.status === 'published')
    .sort((a, b) => b._sortDate.localeCompare(a._sortDate) || a.title.localeCompare(b.title, 'zh-CN'))
    .map(({ _sortDate, status, ...post }) => post);

  if (!posts.length) throw new Error('至少需要一篇 status: published 的 Markdown 文章。');
  return posts;
}

function build() {
  const posts = readPosts();
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  staticFiles.forEach(copyFile);
  staticFiles.filter((file) => file.endsWith('.html')).forEach(versionHtmlAssets);
  copyDirectory(path.join(ROOT, 'uploads'), path.join(DIST, 'uploads'));
  const payload = `// 由 scripts/build-static.js 自动生成，请编辑 content/posts 下的 Markdown。\nwindow.blogPosts = ${JSON.stringify(posts, null, 2)};\n`;
  fs.writeFileSync(path.join(DIST, 'data.js'), payload, 'utf8');
  fs.writeFileSync(path.join(DIST, 'site-manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), buildVersion, posts: posts.map(({ bodyMarkdown, ...post }) => post) }, null, 2) + '\n', 'utf8');
  console.log(`已生成静态站点：${posts.length} 篇文章 -> dist/`);
}

try {
  build();
  if (checkOnly) console.log('静态构建检查通过。');
} catch (error) {
  console.error(`静态构建失败：${error.message}`);
  process.exitCode = 1;
}
