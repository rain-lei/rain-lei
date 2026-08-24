# Astro 博客发布与回滚

本站使用 **Astro 5 + TypeScript + Content Collections + Pagefind + Docker Nginx**。生产环境没有业务 API 和数据库；Markdown 是内容事实源，Astro 在构建阶段生成全部页面。

## 架构

```text
content/posts/*.md
        ↓ Content Collections + Schema 校验
Astro 静态页面 + Pagefind 全文索引
        ↓ Docker 多阶段构建
Nginx 静态容器（127.0.0.1:8080）
        ↓ 宿主机 HTTPS 反向代理
https://www.rainlei.xyz
```

主要目录：

```text
content/posts/             文章事实源
uploads/                   文章图片
site/src/pages/            Astro 页面与路由
site/src/layouts/          全站布局
site/src/content.config.ts 文章 Schema
site/src/scripts/          浏览器端增强交互
site/dist/                 构建产物（不提交）
```

## 本地开发

要求 Node.js 22 及 Corepack：

```bash
corepack enable
corepack prepare pnpm@10.15.1 --activate
pnpm install
pnpm check
pnpm dev
```

`pnpm check` 会依次执行 Astro 类型检查、内容 Schema 校验、静态构建与 Pagefind 索引生成。

## 自动部署

1. 代码推送到 `main`；
2. `Validate Astro blog` 工作流执行类型与构建检查；
3. 部署工作流通过固定 SSH 主机指纹连接服务器；
4. 服务器按精确 Commit SHA 获取源码并执行 Docker 多阶段构建；
5. 新容器在 `127.0.0.1:8080` 通过健康检查后成为当前版本；
6. 失败时自动恢复上一容器。

旧的 `/articles.html`、`/admin.html` 和 `/article.html?id=...` 会跳转到新的 Astro 路由，已有链接继续可用。

## 隐私

不要提交 `.env`、私钥、Token、数据库、日志、服务器密码或个人敏感信息。GitHub Actions 连接信息只存放在仓库 Secrets 中。
