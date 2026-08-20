# Contributing

感谢你为 rain 的个人博客提交改进。

## 本地开发

```bash
cp .env.example .env
npm start
```

Node.js 需要 22.5 或更高版本。数据库会自动创建在 `data/blog.sqlite`，该目录已被 `.gitignore` 忽略。

## 可以提交什么

- 友链申请：修改 `friend-links.json`，使用 `Friend link` PR 模板。
- 前端改进：说明页面、交互或可访问性变化，并附上截图或复现步骤。
- API / 后台改进：说明数据库变更、接口变化和迁移方式。

## 不要提交什么

- `.env`、密码、Cookie、API token、数据库文件。
- 未获得授权的图片、字体文件、文章或品牌素材。
- 直接修改线上数据库的导出文件。

所有 PR 都需要通过维护者审核后才能合并。
