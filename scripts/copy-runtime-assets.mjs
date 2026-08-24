import { cp, copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'site', 'dist');
await mkdir(dist, { recursive: true });
await cp(resolve(root, 'uploads'), resolve(dist, 'uploads'), { recursive: true, force: true });
await copyFile(resolve(root, 'friend-links.json'), resolve(dist, 'friend-links.json'));
console.log('已复制文章图片与友链数据。');
