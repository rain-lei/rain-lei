const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const seedPosts = require('./data.js');
const { estimateReadTime } = require('./markdown.js');
const { uploadImageToGitHub } = require('./github-media.js');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const DB_PATH = process.env.DB_PATH || path.join(ROOT, 'data', 'blog.sqlite');
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const sessions = new Map();

if (!ADMIN_PASSWORD) {
  console.error('Missing ADMIN_PASSWORD. Set it in .env or the process environment before starting the server.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

const CATEGORY_LABELS = {
  study: '学习',
  life: '生活',
  entertainment: '娱乐',
};

const CATEGORY_ALIASES = {
  product: 'study',
  design: 'entertainment',
  life: 'life',
};

const THEME_DEFAULTS = {
  sunset: '落日',
  blue: '蓝调',
  green: '青绿',
  cream: '米白',
  purple: '紫雾',
  orange: '橘光',
};

const THEME_SETTING_DEFAULTS = {
  themeLabelSunset: THEME_DEFAULTS.sunset,
  themeLabelBlue: THEME_DEFAULTS.blue,
  themeLabelGreen: THEME_DEFAULTS.green,
  themeLabelCream: THEME_DEFAULTS.cream,
  themeLabelPurple: THEME_DEFAULTS.purple,
  themeLabelOrange: THEME_DEFAULTS.orange,
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function now() {
  return new Date().toISOString();
}

function slugify(value) {
  return (
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `post-${Date.now()}`
  );
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(String(password), salt, 64).toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [salt, encoded] = String(stored || '').split(':');
  if (!salt || !encoded) return false;
  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(encoded));
}

function bodyArrayToMarkdown(body) {
  if (!Array.isArray(body)) return '';
  return body.map((part) => String(part ?? '').trim()).filter(Boolean).join('\n\n');
}

function normalizeMarkdownInput(value) {
  if (Array.isArray(value)) return bodyArrayToMarkdown(value);
  if (value == null) return '';

  const raw = String(value).replace(/\r\n?/g, '\n').trim();
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return bodyArrayToMarkdown(parsed);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.markdown === 'string') {
        return String(parsed.markdown).replace(/\r\n?/g, '\n').trim();
      }
      if (Array.isArray(parsed.body)) return bodyArrayToMarkdown(parsed.body);
    }
    if (typeof parsed === 'string') return String(parsed).replace(/\r\n?/g, '\n').trim();
  } catch (_) {}

  return raw;
}

function markdownToParagraphs(markdown) {
  const text = normalizeMarkdownInput(markdown);
  if (!text) return [];
  return text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

function bodyMarkdownToLegacyJson(markdown) {
  return JSON.stringify(markdownToParagraphs(markdown));
}

function serializePost(row) {
  const bodyMarkdown = normalizeMarkdownInput(row.body_markdown ?? row.body_json ?? row.body ?? '');
  return {
    ...row,
    featured: Boolean(row.featured),
    categoryLabel: row.category_label,
    bodyMarkdown,
    body: markdownToParagraphs(bodyMarkdown),
    read: row.read_time,
  };
}

function publicPosts() {
  return db
    .prepare("SELECT * FROM posts WHERE status='published' ORDER BY date DESC, updated_at DESC")
    .all()
    .map(serializePost);
}

function adminPosts() {
  return db.prepare('SELECT * FROM posts ORDER BY date DESC, updated_at DESC').all().map(serializePost);
}

function settings() {
  return Object.fromEntries(db.prepare('SELECT key, value FROM settings').all().map((row) => [row.key, row.value]));
}

function tableColumns(table) {
  return new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name));
}

function ensureColumn(table, column, definition) {
  if (!tableColumns(table).has(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function backfillMarkdownColumn() {
  const rows = db.prepare('SELECT id, body_json, body_markdown FROM posts').all();
  const update = db.prepare('UPDATE posts SET body_markdown=? WHERE id=?');

  for (const row of rows) {
    if (normalizeMarkdownInput(row.body_markdown)) continue;
    const markdown = normalizeMarkdownInput(row.body_json);
    if (markdown) update.run(markdown, row.id);
  }
}

function syncReadTimeColumn() {
  const rows = db.prepare('SELECT id, body_markdown, read_time FROM posts').all();
  const update = db.prepare('UPDATE posts SET read_time=? WHERE id=?');

  for (const row of rows) {
    const bodyMarkdown = normalizeMarkdownInput(row.body_markdown);
    const readTime = estimateReadTime(bodyMarkdown);
    if (String(row.read_time || '') !== readTime) {
      update.run(readTime, row.id);
    }
  }
}

function migratePostCategories() {
  const migrate = db.prepare('UPDATE posts SET category=?, category_label=? WHERE category=?');
  migrate.run('study', CATEGORY_LABELS.study, 'product');
  migrate.run('entertainment', CATEGORY_LABELS.entertainment, 'design');
  db.prepare('UPDATE posts SET category_label=? WHERE category=?').run(CATEGORY_LABELS.life, 'life');
}

function seed() {
  if (Number(db.prepare('SELECT COUNT(*) count FROM posts').get().count) === 0) {
    const insert = db.prepare(
      'INSERT INTO posts(id, category, category_label, date, read_time, title, excerpt, featured, accent, body_json, body_markdown, status, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );

    for (const post of seedPosts) {
      const timestamp = now();
      const markdown = normalizeMarkdownInput(post.bodyMarkdown ?? post.body ?? '');
      const readTime = estimateReadTime(markdown);
      insert.run(
        post.id,
        post.category,
        post.categoryLabel,
        post.date,
        readTime,
        post.title,
        post.excerpt,
        post.featured ? 1 : 0,
        post.accent,
        bodyMarkdownToLegacyJson(markdown),
        markdown,
        'published',
        timestamp,
        timestamp
      );
    }
  }

  if (Number(db.prepare('SELECT COUNT(*) count FROM users').get().count) === 0) {
    db.prepare('INSERT INTO users(username, password_hash, created_at) VALUES(?,?,?)').run(
      ADMIN_USER,
      hashPassword(ADMIN_PASSWORD),
      now()
    );
  }

  const ensureSetting = db.prepare('INSERT OR IGNORE INTO settings(key, value) VALUES(?, ?)');
  [
    ['siteName', 'rain'],
    ['siteEmail', 'rain__lei@outlook.com'],
    ['intro', '这里是 rain 的个人角落。记录代码、项目实践和日常生活里遇见的问题，也分享那些值得反复思考的小事。'],
    ['themeLabelSunset', THEME_DEFAULTS.sunset],
    ['themeLabelBlue', THEME_DEFAULTS.blue],
    ['themeLabelGreen', THEME_DEFAULTS.green],
    ['themeLabelCream', THEME_DEFAULTS.cream],
    ['themeLabelPurple', THEME_DEFAULTS.purple],
    ['themeLabelOrange', THEME_DEFAULTS.orange],
  ].forEach((entry) => ensureSetting.run(...entry));

  if (Number(db.prepare('SELECT COUNT(*) count FROM friend_links').get().count) === 0) {
    const timestamp = now();
    db.prepare(
      'INSERT INTO friend_links(name, url, avatar, description, sort_order, enabled, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?)'
    ).run('rain-lei · GitHub', 'https://github.com/rain-lei', 'https://github.com/rain-lei.png?size=160', '代码、项目与最近的仓库', 0, 1, timestamp, timestamp);
  }
}

db.exec(`
  PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    accent TEXT NOT NULL DEFAULT 'sunset',
    body_json TEXT NOT NULL DEFAULT '',
    body_markdown TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS friend_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    avatar TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

ensureColumn('posts', 'body_markdown', "TEXT NOT NULL DEFAULT ''");
backfillMarkdownColumn();
syncReadTimeColumn();
migratePostCategories();
seed();

function send(res, status, data, headers = {}) {
  const isString = typeof data === 'string';
  res.writeHead(status, {
    'Content-Type': headers['Content-Type'] || (isString ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8'),
    'Cache-Control': headers['Cache-Control'] || 'no-store',
    ...headers,
  });
  res.end(isString ? data : JSON.stringify(data));
}

function cookieMap(req) {
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map((item) => item.trim().split('=').map(decodeURIComponent))
      .filter((item) => item.length === 2)
  );
}

function user(req) {
  const token = cookieMap(req).blog_session;
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return db.prepare('SELECT id, username FROM users WHERE id=?').get(session.userId) || null;
}

function auth(req, res) {
  const current = user(req);
  if (!current) {
    send(res, 401, { error: '请先登录管理后台' });
    return null;
  }
  return current;
}

function readBody(req, limit = 2_000_000) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > limit) {
        const error = new Error('请求体过大');
        error.statusCode = 413;
        req.destroy();
        reject(error);
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (_) {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

function normalizePostPayload(payload, existing = {}) {
  const title = String(payload.title ?? existing.title ?? '').trim();
  if (!title) throw Error('标题不能为空');

  const rawCategory = String(payload.category ?? existing.category ?? 'life');
  const category = CATEGORY_ALIASES[rawCategory]
    || (Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, rawCategory) ? rawCategory : 'life');
  const status = ['published', 'draft'].includes(payload.status ?? existing.status)
    ? String(payload.status ?? existing.status)
    : 'published';
  const bodyMarkdown = normalizeMarkdownInput(
    payload.bodyMarkdown ?? payload.body ?? existing.body_markdown ?? existing.body_json ?? existing.body ?? ''
  );
  const readTime = estimateReadTime(bodyMarkdown);

  return {
    id: String(payload.id || existing.id || slugify(title)),
    category,
    category_label: CATEGORY_LABELS[category],
    date: String(payload.date ?? existing.date ?? new Date().toISOString().slice(0, 10).replaceAll('-', '.')),
    read_time: readTime,
    title,
    excerpt: String(payload.excerpt ?? existing.excerpt ?? ''),
    featured: payload.featured === undefined ? Number(existing.featured || 0) : payload.featured ? 1 : 0,
    accent: String(payload.accent ?? existing.accent ?? 'sunset'),
    body_json: bodyMarkdownToLegacyJson(bodyMarkdown),
    body_markdown: bodyMarkdown,
    status,
    updated_at: now(),
  };
}

async function handleApi(req, res, url) {
  const method = req.method;
  const pathname = url.pathname;

  try {
    if (method === 'GET' && pathname === '/api/posts') return send(res, 200, publicPosts());
    if (method === 'GET' && pathname === '/api/settings') return send(res, 200, settings());

    if (method === 'POST' && pathname === '/api/auth/login') {
      const body = await readBody(req);
      const account = db
        .prepare('SELECT id, username, password_hash FROM users WHERE username=?')
        .get(String(body.username || ''));
      if (!account || !verifyPassword(body.password, account.password_hash)) {
        return send(res, 401, { error: '用户名或密码不正确' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { userId: account.id, expiresAt: Date.now() + 604800000 });
      return send(
        res,
        200,
        { username: account.username },
        {
          'Set-Cookie': `blog_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`,
        }
      );
    }

    if (method === 'POST' && pathname === '/api/auth/logout') {
      const token = cookieMap(req).blog_session;
      if (token) sessions.delete(token);
      return send(
        res,
        200,
        { ok: true },
        {
          'Set-Cookie': 'blog_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0',
        }
      );
    }

    if (method === 'GET' && pathname === '/api/auth/me') {
      const current = user(req);
      return send(res, 200, current ? { authenticated: true, username: current.username } : { authenticated: false });
    }

    if (!pathname.startsWith('/api/admin/')) return send(res, 404, { error: 'Not found' });
    if (!auth(req, res)) return;

    if (method === 'GET' && pathname === '/api/admin/posts') return send(res, 200, adminPosts());
    if (method === 'GET' && pathname === '/api/admin/settings') return send(res, 200, settings());

    if (method === 'PUT' && pathname === '/api/admin/settings') {
      const body = await readBody(req);
      const updater = db.prepare(
        'INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
      );
      for (const [key, value] of Object.entries(body)) {
        if (['siteName', 'siteEmail', 'intro'].includes(key)) {
          updater.run(key, String(value).trim());
        } else if (key in THEME_SETTING_DEFAULTS) {
          updater.run(key, String(value).trim() || THEME_SETTING_DEFAULTS[key]);
        }
      }
      return send(res, 200, settings());
    }

    if (method === 'POST' && pathname === '/api/admin/uploads/image') {
      const body = await readBody(req, 20_000_000);
      const result = await uploadImageToGitHub({
        filename: String(body.filename || body.name || 'image'),
        dataUrl: String(body.dataUrl || body.content || ''),
      });
      return send(res, 201, result);
    }

    if (method === 'POST' && pathname === '/api/admin/posts') {
      const body = await readBody(req);
      const post = normalizePostPayload(body);
      const createdAt = now();
      db.prepare(
        'INSERT INTO posts(id, category, category_label, date, read_time, title, excerpt, featured, accent, body_json, body_markdown, status, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
      ).run(
        post.id,
        post.category,
        post.category_label,
        post.date,
        post.read_time,
        post.title,
        post.excerpt,
        post.featured,
        post.accent,
        post.body_json,
        post.body_markdown,
        post.status,
        createdAt,
        createdAt
      );
      return send(res, 201, serializePost(db.prepare('SELECT * FROM posts WHERE id=?').get(post.id)));
    }

    const postMatch = pathname.match(/^\/api\/admin\/posts\/([^/]+)$/);
    if (postMatch && (method === 'PUT' || method === 'DELETE')) {
      const id = decodeURIComponent(postMatch[1]);
      const existing = db.prepare('SELECT * FROM posts WHERE id=?').get(id);
      if (!existing) return send(res, 404, { error: '文章不存在' });

      if (method === 'DELETE') {
        db.prepare('DELETE FROM posts WHERE id=?').run(id);
        return send(res, 200, { ok: true });
      }

      const body = await readBody(req);
      const post = normalizePostPayload({ ...body, id }, existing);
      db.prepare(
        'UPDATE posts SET category=?, category_label=?, date=?, read_time=?, title=?, excerpt=?, featured=?, accent=?, body_json=?, body_markdown=?, status=?, updated_at=? WHERE id=?'
      ).run(
        post.category,
        post.category_label,
        post.date,
        post.read_time,
        post.title,
        post.excerpt,
        post.featured,
        post.accent,
        post.body_json,
        post.body_markdown,
        post.status,
        post.updated_at,
        id
      );
      return send(res, 200, serializePost(db.prepare('SELECT * FROM posts WHERE id=?').get(id)));
    }

    if (method === 'GET' && pathname === '/api/admin/friend-links') {
      return send(res, 200, listAdminFriendLinks());
    }

    if (method === 'POST' && pathname === '/api/admin/friend-links') {
      const body = await readBody(req);
      const name = String(body.name || '').trim();
      const urlValue = String(body.url || '').trim();
      if (!name || !urlValue) throw Error('友链名称和网址不能为空');

      const timestamp = now();
      db.prepare(
        'INSERT INTO friend_links(name, url, avatar, description, sort_order, enabled, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?)'
      ).run(
        name,
        urlValue,
        String(body.avatar || ''),
        String(body.description || ''),
        Number(body.sort_order || 0),
        body.enabled === false ? 0 : 1,
        timestamp,
        timestamp
      );
      return send(res, 201, listAdminFriendLinks());
    }

    const friendMatch = pathname.match(/^\/api\/admin\/friend-links\/(\d+)$/);
    if (friendMatch && (method === 'PUT' || method === 'DELETE')) {
      const id = Number(friendMatch[1]);
      if (method === 'DELETE') {
        db.prepare('DELETE FROM friend_links WHERE id=?').run(id);
        return send(res, 200, { ok: true });
      }

      const body = await readBody(req);
      const name = String(body.name || '').trim();
      const urlValue = String(body.url || '').trim();
      if (!name || !urlValue) throw Error('友链名称和网址不能为空');
      db.prepare(
        'UPDATE friend_links SET name=?, url=?, avatar=?, description=?, sort_order=?, enabled=?, updated_at=? WHERE id=?'
      ).run(
        name,
        urlValue,
        String(body.avatar || ''),
        String(body.description || ''),
        Number(body.sort_order || 0),
        body.enabled === false ? 0 : 1,
        now(),
        id
      );
      return send(res, 200, listAdminFriendLinks());
    }

    if (method === 'POST' && pathname === '/api/admin/friend-links/sync') {
      const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'friend-links.json'), 'utf8'));
      const items = Array.isArray(source.links) ? source.links : [];
      const upsert = db.prepare(
        'INSERT INTO friend_links(name, url, avatar, description, sort_order, enabled, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(url) DO UPDATE SET name=excluded.name, avatar=excluded.avatar, description=excluded.description, sort_order=excluded.sort_order, enabled=excluded.enabled, updated_at=excluded.updated_at'
      );
      const timestamp = now();
      for (const item of items) {
        if (item.name && item.url) {
          upsert.run(
            String(item.name),
            String(item.url),
            String(item.avatar || ''),
            String(item.description || ''),
            Number(item.sort_order || 0),
            item.enabled === false ? 0 : 1,
            timestamp,
            timestamp
          );
        }
      }
      return send(res, 200, { count: items.length, links: listAdminFriendLinks() });
    }

    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    const status = Number(error.statusCode || error.status || 400);
    return send(res, status >= 400 && status < 600 ? status : 400, { error: error.message || '请求失败' });
  }
}

function listFriendLinks() {
  return db
    .prepare('SELECT id, name, url, avatar, description, sort_order, enabled FROM friend_links WHERE enabled=1 ORDER BY sort_order ASC, id ASC')
    .all()
    .map((row) => ({ ...row, enabled: Boolean(row.enabled) }));
}

function listAdminFriendLinks() {
  return db
    .prepare('SELECT id, name, url, avatar, description, sort_order, enabled FROM friend_links ORDER BY sort_order ASC, id ASC')
    .all()
    .map((row) => ({ ...row, enabled: Boolean(row.enabled) }));
}

function staticFile(req, res, url) {
  let pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  if (pathname === '/admin') pathname = '/admin.html';

  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (!filePath.startsWith(path.resolve(ROOT))) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) return send(res, 404, 'Not found');
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  return staticFile(req, res, url);
});

server.listen(PORT, () => {
  console.log(`rain blog running at http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
