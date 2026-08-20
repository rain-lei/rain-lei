# 友链 PR 规范

友链采用“公开 JSON + Pull Request”方式维护，文件是 [`friend-links.json`](./friend-links.json)。这样任何人都可以提交友链申请，维护者审核后合并，不需要直接访问服务器后台。

## 提交步骤

1. Fork 本仓库并新建分支，例如 `friend-link-your-name`。
2. 只修改 `friend-links.json`，在 `links` 数组末尾添加一条记录。
3. 确保 `url` 使用 `https://`，站点可以正常访问，头像是公开可访问的图片地址。
4. 发起 Pull Request，使用仓库中的 `Friend link` 模板。
5. 维护者审核链接安全性、内容质量和互链情况后合并。

## 字段说明

```json
{
  "name": "你的站点名称",
  "url": "https://example.com",
  "avatar": "https://example.com/avatar.png",
  "description": "一句话介绍，不超过 80 个字",
  "sort_order": 10,
  "enabled": true
}
```

- `name`、`url` 必填，`url` 必须是完整 HTTPS 地址。
- `avatar` 可选；留空时前台会尝试使用网站 favicon。
- `description` 用于卡片副标题，不要放联系方式、脚本或 HTML。
- `sort_order` 越小越靠前，默认从 `10` 开始递增。
- `enabled` 为 `false` 时暂时隐藏但保留记录。

## 合并后同步到 SQLite

如果博客使用 Node + SQLite 后端，合并 PR 后在服务器后台执行友链导入；如果部署的是纯静态前端，则前端会直接读取这个 JSON 文件作为降级数据源。

请不要在 PR 中提交数据库文件、密码、`.env`、访问令牌或其他私密信息。
