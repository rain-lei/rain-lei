# 友链 PR 规范

友链由仓库根目录的 `friend-links.json` 直接渲染；合并后会随静态站点自动发布，无需导入数据库。

## 申请步骤

1. Fork 本仓库并创建分支，例如 `friend-link-your-name`。
2. 只修改 `friend-links.json`，在 `links` 数组追加自己的记录。
3. 优先使用 GitHub 头像，例如 `https://github.com/<用户名>.png?size=160`；也可以使用有公开授权、稳定可访问的图片。
4. 确认 URL 是可访问的 HTTPS 地址，说明不超过 80 个字。
5. 提交 Pull Request，维护者审核后合并发布。

Pull Request 会自动运行 `pnpm check`。友链文件未通过格式校验时不会进入发布流程，检查结果会指出具体字段。

## 数据格式

```json
{
  "name": "你的站点名称",
  "url": "https://example.com",
  "avatar": "https://github.com/your-name.png?size=160",
  "description": "一句话介绍，不超过 80 个字",
  "sort_order": 10,
  "enabled": true
}
```

- `name`、`url` 必填；`url` 必须是完整 HTTPS 地址。
- `avatar` 可选；留空时前台会尝试读取站点 favicon。
- `sort_order` 越小越靠前；新增条目可使用 `20`、`30` 等。
- `enabled: false` 可暂时隐藏条目。

前台只展示启用且地址有效的条目，并按 `sort_order` 从小到大排列。头像加载失败时会自动退回站点首字母，不会影响其余友链显示。

不要在友链 PR 中提交密码、密钥、数据库、无授权素材或跳转到恶意页面。
