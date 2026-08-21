---
id: windows-开发工具清单
title: Windows 开发工具清单
excerpt: 罗列本机已安装的常见程序员应用，并说明各工具的主要功能。
category: life
date: 2026-08-20
status: published
accent: sunset
---

# Windows 开发工具清单

> 以下内容根据本机软件清单与命令行版本检测结果整理，记录于 2026 年 8 月 20 日。软件版本会随更新变化。

## 编辑器与 IDE

| 工具 | 主要用途 |
| --- | --- |
| Visual Studio Code | 通用代码编辑器，支持前端、脚本、配置文件和扩展 |
| IntelliJ IDEA | Java、Kotlin 项目开发，提供代码分析、调试和重构 |
| PyCharm | Python 开发、调试、测试和解释器管理 |
| Visual Studio Community | C/C++、Windows 应用、编译器和大型解决方案 |

VS Code 依靠扩展保持轻量；IntelliJ IDEA 和 PyCharm 集成了更完整的语言服务；Visual Studio 则提供 Windows 开发所需的编译、调试和 SDK 工具链。

## 语言环境与运行时

| 环境 | 主要用途 |
| --- | --- |
| Node.js / npm | JavaScript 运行时、包管理和构建脚本 |
| Python / Miniconda | 脚本、自动化、数据处理和隔离开发环境 |
| JDK | Java 编译、运行和 Maven 项目构建 |
| Rust / Cargo | Rust 编译、依赖管理和系统工具开发 |
| .NET Runtime | 运行 .NET 应用；完整开发还需要安装 SDK |

多 JDK、多 Python 环境并存时，要明确记录项目版本要求，并确认 `JAVA_HOME`、解释器路径和 PATH 配置。

## 版本控制、容器与部署

| 工具 | 主要用途 |
| --- | --- |
| Git | 版本控制、分支管理、协作和远程仓库同步 |
| OpenSSH | SSH 登录、端口转发和安全文件传输 |
| Docker Desktop / Engine | 镜像构建、容器运行和图形管理 |
| Docker Compose | 定义和启动多容器应用 |
| kubectl | Kubernetes 集群资源管理 |
| Apache Maven | Java 项目依赖管理、编译、测试和打包 |

常见部署路径：

```text
Git 提交 -> GitHub 仓库 -> SSH 连接云服务器 -> Docker 构建 -> Nginx 对外提供网站
```

## 数据库、浏览器与验证

MySQL 和 Navicat 适合连接、查看表结构、执行查询和导入导出；Chrome、Edge、Firefox 用于不同内核下的调试和兼容性测试。生产环境操作前应先确认目标服务器，并完成备份。

## 常见开发流程

1. 使用编辑器或 IDE 编写代码。
2. 使用 Git 保存版本并同步远程仓库。
3. 使用 npm、Maven 或 Cargo 安装依赖并执行构建。
4. 使用 Docker 在一致的环境中运行服务。
5. 使用浏览器和数据库工具进行功能验证。

## 使用注意事项

- 不把 `.env`、私钥、数据库文件和本地缓存提交到远程仓库。
- 升级核心运行时前先确认项目依赖和构建脚本是否兼容。
- 更新服务器前保留上一个可用的 Docker 镜像或发布版本。
