const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'site', 'dist');
const port = Number(process.env.PORT || 8080);
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp',
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  const safeTarget = target.startsWith(`${root}${path.sep}`) || target === root;
  let file = path.join(root, '404.html');
  let status = 404;
  if (safeTarget && fs.existsSync(target)) {
    const stat = fs.statSync(target);
    if (stat.isFile()) { file = target; status = 200; }
    if (stat.isDirectory()) {
      const directoryIndex = path.join(target, 'index.html');
      if (fs.existsSync(directoryIndex) && fs.statSync(directoryIndex).isFile()) { file = directoryIndex; status = 200; }
    }
  }
  response.writeHead(status, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`静态站点预览：http://127.0.0.1:${port}`));
