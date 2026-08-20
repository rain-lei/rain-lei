# rain · 个人博客

这是一个带管理后台、API 和 SQLite 数据库的全栈个人博客。前台仍保留静态种子数据，Node 服务启动后会自动从数据库读取文章与设置。

## 本地运行

```bash
npm start
```

打开 <http://localhost:8080>，管理后台位于 <http://localhost:8080/admin.html>。

首次登录账号由 `ADMIN_USER` 和 `ADMIN_PASSWORD` 环境变量决定；请勿把真实密码写入仓库。

SQLite 数据库默认写入 `data/blog.sqlite`，可用 `DB_PATH` 指定位置。

## Docker 部署

```bash
docker build -t linmo-blog .
docker run -d --name linmo-blog -p 8080:8080 -e ADMIN_USER=your-name -e ADMIN_PASSWORD='use-a-long-random-password' -v blog-data:/app/data linmo-blog
```

## 个性化

- 文章内容首次启动时从 `data.js` 种子到数据库，之后建议直接使用 `/admin.html` 管理。
- 首页“最近的仓库”会从 `https://api.github.com/users/rain-lei/repos` 读取最近更新的公开仓库；API 不可用时会降级为 GitHub 仓库入口。
- 站点名称、邮箱和社交链接位于 `index.html` / `article.html` 的页头与页脚。
- `styles.css` 顶部的 CSS 变量可以快速替换品牌色和纸张色。

## GitHub 上架前检查

建议先复制 `.env.example` 为 `.env`，只在本机保存真实管理员密码；`.env`、SQLite 数据库和日志已加入忽略规则，不要上传到公开仓库。

公开仓库建议至少保留以下文件：

- `README.md`：项目介绍、运行与部署说明
- `CONTRIBUTING.md`：贡献规范
- `FRIEND_LINKS.md`：友链 PR 规范
- `.github/PULL_REQUEST_TEMPLATE/`：PR 模板
- `friend-links.json`：可审核的友链清单

友链 PR 的完整流程见 [FRIEND_LINKS.md](FRIEND_LINKS.md)。合并友链 PR 后，可以在后台点击“导入 PR 友链”，把 JSON 同步到 SQLite。

首次推送到 GitHub：

```bash
git init
git add .
git commit -m "feat: add rain personal blog"
git branch -M main
git remote add origin https://github.com/rain-lei/你的仓库名.git
git push -u origin main
```

不要提交：`.env`、`data/*.sqlite*`、管理员密码、API token、用户隐私数据或没有授权的第三方素材。
