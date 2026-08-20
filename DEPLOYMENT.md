# rain blog · 部署与开发说明

这是一个带管理后台、API 和 SQLite 数据库的全栈个人博客。前台保留静态种子数据，Node 服务启动后会自动从数据库读取文章、设置和友链。

## 本地运行

```bash
cp .env.example .env
# 编辑 .env，至少设置 ADMIN_PASSWORD
# 如果要使用“上传图片并同步到 GitHub”，再补：
# GITHUB_UPLOAD_OWNER=rain-lei
# GITHUB_UPLOAD_REPO=rain-lei
# GITHUB_UPLOAD_BRANCH=main
# GITHUB_UPLOAD_PATH=uploads
# GITHUB_UPLOAD_TOKEN=你的 GitHub token（需要 contents:write 权限）
npm start
```

打开 <http://localhost:8080>，管理后台位于 <http://localhost:8080/admin.html>。

SQLite 数据库默认写入 `data/blog.sqlite`，该目录不会被提交到 Git。

图片上传会在后台直接调用 GitHub Contents API，把文件写入仓库的 `uploads/` 目录；前台 Markdown 里保存的是 GitHub 的稳定图片链接，因此即使服务器后续迁移，图片也不会丢。

## Docker 部署

```bash
docker build -t rain-blog .
docker run -d --name rain-blog -p 127.0.0.1:8080:8080 \
  --restart unless-stopped --env-file .env -v blog-data:/app/data rain-blog
```

## GitHub 更新

```bash
git pull --ff-only origin main
docker build -t rain-blog .
docker rm -f rain-blog
docker run -d --name rain-blog -p 127.0.0.1:8080:8080 \
  --restart unless-stopped --env-file .env -v blog-data:/app/data rain-blog
```

## 相关文档

- [友链 PR 规范](FRIEND_LINKS.md)
- [贡献指南](CONTRIBUTING.md)
- [环境变量模板](.env.example)
