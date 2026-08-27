import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve(process.argv[2] || 'friend-links.json');
const errors = [];

function parseHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

let data;
try {
  data = JSON.parse(await readFile(source, 'utf8'));
} catch (error) {
  console.error(`友链校验失败：无法读取或解析 ${source}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (data?.version !== 1) errors.push('version 必须为 1');
if (!Array.isArray(data?.links)) {
  errors.push('links 必须是数组');
} else {
  const urls = new Set();
  data.links.forEach((link, index) => {
    const field = `links[${index}]`;
    if (!link || typeof link !== 'object' || Array.isArray(link)) {
      errors.push(`${field} 必须是对象`);
      return;
    }
    const name = typeof link.name === 'string' ? link.name.trim() : '';
    if (!name || name.length > 60) errors.push(`${field}.name 必须是 1–60 个字符`);
    const site = typeof link.url === 'string' ? parseHttps(link.url) : null;
    if (!site) errors.push(`${field}.url 必须是无账号信息的 HTTPS 地址`);
    else if (urls.has(site.href)) errors.push(`${field}.url 与已有友链重复`);
    else urls.add(site.href);
    if (link.avatar != null && link.avatar !== '' && (typeof link.avatar !== 'string' || !parseHttps(link.avatar))) errors.push(`${field}.avatar 必须留空或使用 HTTPS 地址`);
    if (link.description != null && (typeof link.description !== 'string' || link.description.trim().length > 80)) errors.push(`${field}.description 必须是 0–80 个字符`);
    if (!Number.isInteger(link.sort_order)) errors.push(`${field}.sort_order 必须是整数`);
    if (typeof link.enabled !== 'boolean') errors.push(`${field}.enabled 必须是布尔值`);
  });
}

if (errors.length) {
  console.error(`友链校验失败（${errors.length} 项）：`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const enabled = data.links.filter((link) => link.enabled).length;
console.log(`友链校验通过：${data.links.length} 条记录，${enabled} 条启用。`);
