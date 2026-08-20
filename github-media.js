const crypto = require('node:crypto');
const path = require('node:path');

const MIME_EXTENSIONS = new Map([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/gif', '.gif'],
  ['image/webp', '.webp'],
  ['image/svg+xml', '.svg'],
  ['image/avif', '.avif'],
  ['image/bmp', '.bmp'],
  ['image/x-icon', '.ico'],
  ['image/vnd.microsoft.icon', '.ico'],
]);

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanSegment(value, fallback = 'image') {
  const text = String(value ?? '').trim();
  if (!text) return fallback;

  return text
    .normalize('NFKD')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || fallback;
}

function trimSlashes(value) {
  return String(value ?? '').trim().replace(/^\/+|\/+$/g, '');
}

function encodePathSegments(value) {
  return String(value ?? '')
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function extensionFromFilename(filename) {
  const ext = path.extname(String(filename ?? '')).toLowerCase();
  if (!ext) return '';
  if (ext === '.jpeg') return '.jpg';
  if (MIME_EXTENSIONS.has(`image/${ext.slice(1)}`)) return ext;
  if (ext === '.jpg' || ext === '.png' || ext === '.gif' || ext === '.webp' || ext === '.svg' || ext === '.avif' || ext === '.bmp' || ext === '.ico') {
    return ext;
  }
  return '';
}

function extensionFromMime(mime) {
  return MIME_EXTENSIONS.get(String(mime ?? '').toLowerCase()) || '';
}

function sanitizeBaseName(filename) {
  const withoutExt = String(filename ?? '').replace(/\.[^.]+$/, '');
  return cleanSegment(withoutExt, 'image');
}

function parseDataUrl(dataUrl) {
  const text = String(dataUrl ?? '').trim();
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([A-Za-z0-9+/=\s]+)$/i.exec(text);
  if (!match) {
    throw httpError('图片数据格式不正确', 400);
  }

  const mime = String(match[1] || 'application/octet-stream').toLowerCase();
  const base64 = match[2].replace(/\s+/g, '');
  const buffer = Buffer.from(base64, 'base64');

  if (!buffer.length) {
    throw httpError('图片内容为空', 400);
  }

  return { mime, buffer };
}

function buildRawUrl(owner, repo, branch, remotePath, rawBaseUrl) {
  if (rawBaseUrl) {
    return `${String(rawBaseUrl).replace(/\/+$/, '')}/${encodePathSegments(remotePath)}`;
  }

  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${encodePathSegments(remotePath)}`;
}

function githubUploadConfig() {
  const owner = String(process.env.GITHUB_UPLOAD_OWNER || process.env.GITHUB_OWNER || '').trim();
  const repo = String(process.env.GITHUB_UPLOAD_REPO || process.env.GITHUB_REPO || '').trim();
  const branch = String(process.env.GITHUB_UPLOAD_BRANCH || 'main').trim() || 'main';
  const token = String(process.env.GITHUB_UPLOAD_TOKEN || process.env.GITHUB_TOKEN || '').trim();
  const pathPrefix = trimSlashes(process.env.GITHUB_UPLOAD_PATH || 'uploads');
  const apiBase = String(process.env.GITHUB_API_BASE || 'https://api.github.com').replace(/\/+$/, '');
  const rawBaseUrl = String(process.env.GITHUB_RAW_BASE_URL || '').trim();

  if (!owner || !repo || !token) {
    throw httpError(
      '未配置 GitHub 图片上传环境变量，请设置 GITHUB_UPLOAD_OWNER、GITHUB_UPLOAD_REPO 和 GITHUB_UPLOAD_TOKEN',
      500
    );
  }

  return { owner, repo, branch, token, pathPrefix, apiBase, rawBaseUrl };
}

function buildRemotePath({ pathPrefix, filename, mime }) {
  const date = new Date();
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const baseName = sanitizeBaseName(filename);
  const extension = extensionFromFilename(filename) || extensionFromMime(mime) || '.bin';
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const folder = pathPrefix ? `${pathPrefix}/${year}/${month}` : `${year}/${month}`;
  return `${folder}/${baseName}-${suffix}${extension}`;
}

async function uploadImageToGitHub({ filename, dataUrl }) {
  const config = githubUploadConfig();
  const { mime, buffer } = parseDataUrl(dataUrl);

  if (!mime.startsWith('image/')) {
    throw httpError('只支持图片文件上传', 415);
  }

  if (buffer.length > 12 * 1024 * 1024) {
    throw httpError('图片超过 12MB，请压缩后再上传', 413);
  }

  const remotePath = buildRemotePath({
    pathPrefix: config.pathPrefix,
    filename,
    mime,
  });
  const content = buffer.toString('base64');
  const response = await fetch(
    `${config.apiBase}/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodePathSegments(remotePath)}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        message: `chore(media): upload ${path.basename(remotePath)}`,
        branch: config.branch,
        content,
      }),
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.message || `GitHub 上传失败（${response.status}）`;
    throw httpError(message, 502);
  }

  const downloadUrl = payload?.content?.download_url || buildRawUrl(config.owner, config.repo, config.branch, remotePath, config.rawBaseUrl);
  const htmlUrl = payload?.content?.html_url || `https://github.com/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/blob/${encodeURIComponent(config.branch)}/${encodePathSegments(remotePath)}`;

  return {
    path: remotePath,
    name: path.basename(remotePath),
    mime,
    size: buffer.length,
    url: downloadUrl,
    htmlUrl,
    sha: payload?.content?.sha || '',
  };
}

module.exports = {
  uploadImageToGitHub,
  githubUploadConfig,
  parseDataUrl,
  buildRawUrl,
};
