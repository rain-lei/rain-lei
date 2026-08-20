# 友链 PR 规范

友链通过 `friend-links.json` 维护。前台会优先读取 `/api/friend-links`，失败时回退到 `friend-links.json`；维护者合并 PR 后，可以在后台点击“导入 PR 友链”把 JSON 同步到 SQLite。

## 提交步骤

1. Fork 本仓库并新建分支，例如 `friend-link-your-name`。
2. 只修改 `friend-links.json`，在 `links` 数组末尾添加一条记录。
3. 确保 `url` 使用 `https://`，站点可以正常访问，头像是公开可访问的图片地址。
4. 发起 Pull Request，使用仓库中的 `友链申请` 模板。
5. 维护者审核链接安全性、内容质量和互链情况后合并。
6. 合并后由维护者在后台点击“导入 PR 友链”，把 JSON 同步到数据库。

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
- `avatar` 可选；留空时前台会自动尝试使用站点 favicon。
- `description` 用于卡片副标题，不要放联系方式、脚本或 HTML。
- `sort_order` 越小越靠前，默认从 `10` 开始递增。
- `enabled` 为 `false` 时暂时隐藏但保留记录。

## 维护约束

- 不要在 PR 中提交数据库文件、密码、`.env`、访问令牌或其他私密信息。
- 不要提交未授权的图片、字体、文章或品牌素材。
- 友链内容必须可以公开访问，不能包含恶意脚本或跳转。
