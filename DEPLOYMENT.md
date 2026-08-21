# 静态博客发布与回滚

本站使用 **Markdown + 静态页面 + Docker Nginx**。不再运行文章 API、管理后台或 SQLite；GitHub 仓库就是内容后台。

## 内容结构

```text
content/posts/       已发布文章（每篇一个 Markdown 文件）
content/templates/   文章模板
uploads/             仓库内图片
friend-links.json    友链数据
scripts/build-static.js  Markdown 构建为前台数据
```

文章最小示例：

```md
---
title: 标题
excerpt: 一句话摘要
category: study # study / life / entertainment
date: 2026-08-21
status: published
accent: blue
---

正文支持图片：![说明](/uploads/2026/example.jpg)
```

`status: draft` 的文章不会出现在网站。阅读时长根据正文自动计算。

## 本地预览构建

```bash
npm run build
```

构建结果在 `dist/`，已被 `.gitignore` 忽略。部署镜像会在 Docker 构建时重新生成它。

## GitHub → 阿里云自动发布

提交推送到 `main` 后，`.github/workflows/deploy.yml` 会：

1. 使用仅用于发布的受限 SSH 密钥连接服务器；
2. 把当前完整 commit SHA 传给服务器；
3. 服务器在 `/opt/rain-blog-releases/<SHA>` 获取该精确版本并构建静态 Nginx 镜像；
4. 新容器在 `127.0.0.1:8080` 健康检查通过后才确认发布；
5. 构建或健康检查失败时，自动恢复此前容器；
6. Action 再检查公开首页与内容工作台。

生产服务器会保留最近的 release 目录和 SHA 历史；原来的 `/opt/rain-blog/data` 也会原样保留，但静态版本不再读取它。

### 必需的 GitHub Secrets

- `DEPLOY_HOST`：服务器公网 IP 或域名。
- `DEPLOY_USER`：受限用户 `deploy`。
- `DEPLOY_SSH_KEY`：GitHub Actions 专用私钥。
- `DEPLOY_KNOWN_HOSTS`：服务器固定 SSH host key。

不要在源码、Issues、日志或文章中放这些值。

## 回滚

打开 GitHub 仓库的 **Actions → Deploy static blog → Run workflow**：

1. `operation` 选 `rollback`；
2. `target_sha` 填需要恢复的 40 位 commit SHA；
3. 运行工作流。

它会重新按该 SHA 构建和发布，而不是依赖某个临时容器，因此即使服务器重启后依然可回滚。确认恢复版本正常后，若要让 Git 分支也回到该状态，再另行创建一个正常的 Git 提交；不要使用不理解的强制推送。

## 隐私边界

仓库只提交可公开的文章、图片、样式和部署脚本。不要提交 `.env`、`*.pem`、Token、密码、数据库、缓存、服务器地址中的带签名参数或个人隐私信息。
