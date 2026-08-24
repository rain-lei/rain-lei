# 内容与提交规范

这个仓库是基于 Astro 的公开静态博客源码和内容库。Git 提交既是内容历史，也是服务器可回滚的发布版本。

## 写文章

1. 从 `content/templates/post.md` 复制模板到 `content/posts/`。
2. 给每篇文章一个稳定、唯一的 `id`；文件名可以使用英文或中文。
3. 分类只使用 `study`（学习）、`life`（生活）、`entertainment`（娱乐）。
4. 图片上传到 `uploads/` 后，用 `![说明](/uploads/路径)` 引用。
5. 提交前执行 `npm run check`，再推送到 `main`。

## 适合提交

- Markdown 文章、公开可用的图片、前端样式和交互。
- `friend-links.json`、友链文档、部署脚本。
- 可公开的说明文档。

## 不要提交

- `.env`、`*.pem`、SSH 私钥、Token、Cookie、密码。
- 数据库、日志、构建产物 `dist/`、`node_modules/`。

## 提交前检查

```bash
pnpm install
pnpm check
```

Content Collections 会验证文章标题、摘要、分类、日期、状态和视觉主题；Pagefind 在生产构建后生成全文搜索索引。
- 未授权的图片、字体、文章或品牌素材。
- 真实姓名、私人邮箱、手机号、住址等不希望公开的信息。

## 提交前命令

```bash
npm run check
git status
git add <明确列出的文件>
git commit -m "content: add a new post"
git pull --rebase origin main
git push origin main
```
