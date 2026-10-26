# 本地目录与清理

博客需要保留 `site/src/`、`site/public/`、`content/`、`uploads/`、配置文件和依赖锁文件。

`.firecrawl/` 是调研、抓取和截图的临时目录，不参与网站构建。`artifacts/` 存放需要保留的本地报告或压缩备份。两者都不提交到 Git，也不进入 Docker 构建上下文。长期使用的素材应保存到 `uploads/` 或 `site/public/`。

在 Windows 项目根目录先查看清理范围：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-local-cache.ps1 -WhatIf
```

确认后清理：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-local-cache.ps1
```

默认清理 `.firecrawl/`、旧版 `dist/`、Astro 和 Vite 缓存；保留已安装的依赖及 `site/dist/`，便于继续开发和预览。先将临时目录里仍需使用的记录或未完成工作的备份存到 `artifacts/`。

需要同时删除 Astro 构建结果时，加 `-IncludeBuild`。随后运行 `corepack pnpm build` 即可重新生成页面和搜索索引。

2026-10-26 清理前的精简记录保存在本地 `artifacts/maintenance-20261026/history.zip`：包含调研笔记、文章来源文件、待发布改动和恢复信息，不包含旧依赖、重复截图或网页快照。此备份不参与构建。
