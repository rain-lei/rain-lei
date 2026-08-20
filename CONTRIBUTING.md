# 上线与提交规范

这个仓库只保留可公开的源码、文档和图片，不提交服务器私钥、数据库、缓存或个人信息。

## 提交前检查

- 页面或后台能在本地正常打开。
- `.env`、数据库文件、日志、密钥都没有进入提交。
- 新增资源有授权，图片、字体、文章都能公开使用。
- 如果改动了对外展示内容，README 和相关文档已经同步更新。

## 适合提交的内容

- 前端样式、文案、交互和可访问性。
- 管理后台和 API。
- 友链：只修改 `friend-links.json`。
- 文档和部署说明。

## 不要提交的内容

- `.env`、`*.pem`、Token、Cookie、密码。
- `data/*.sqlite`、`node_modules/`、日志、临时文件。
- 未授权的图片、字体、文章、品牌素材。
- 真实姓名、邮箱、手机号等私密信息。

## 推送到 GitHub

```bash
git status
git add <files>
git commit -m "docs: update readme"
git pull --rebase origin main
git push origin main
```

## 发布到服务器

服务器部署使用 Docker + Nginx。源码更新后只替换仓库文件，不把数据库文件提交到 Git。

友链合并后，在后台点击“导入 PR 友链”即可把 `friend-links.json` 同步到 SQLite。
