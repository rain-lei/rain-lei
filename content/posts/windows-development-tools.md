---
id: windows-开发工具清单
title: Windows 开发工具清单
excerpt: Windows 上的编辑器、语言环境、容器和数据库工具，按用途列在一起，方便配置项目时查找。
category: life
illustration: programmer
date: 2026-08-20
updated: 2026-10-17
status: published
accent: sunset
---

下面是 2026 年 8 月 20 日整理的工具清单。配置项目时，先确认项目需要的语言和版本，再找对应的工具。

## 编辑器与 IDE

| 工具 | 主要用途 |
| --- | --- |
| Visual Studio Code | 通用代码编辑器，支持前端、脚本、配置文件和扩展 |
| IntelliJ IDEA | Java、Kotlin 项目开发，提供代码分析、调试和重构 |
| PyCharm | Python 开发、调试、测试和解释器管理 |
| Visual Studio Community | C/C++、Windows 应用、编译器和大型解决方案 |

## 语言环境与运行时

| 环境 | 主要用途 |
| --- | --- |
| Node.js / npm | JavaScript 运行时、包管理和构建脚本 |
| Python / Miniconda | 脚本、自动化、数据处理和隔离开发环境 |
| JDK | Java 编译、运行和 Maven 项目构建 |
| Rust / Cargo | Rust 编译、依赖管理和系统工具开发 |
| .NET Runtime | 运行 .NET 应用；完整开发还需要安装 SDK |

电脑上有多个 JDK 或 Python 版本时，要确认终端和 IDE 用的是哪一个。Java 检查 `JAVA_HOME`，Python 检查项目解释器，命令找不到时再查看 `PATH`。

## 版本控制、容器与部署

| 工具 | 主要用途 |
| --- | --- |
| Git | 版本控制、分支管理、协作和远程仓库同步 |
| OpenSSH | SSH 登录、端口转发和安全文件传输 |
| Docker Desktop / Engine | 构建镜像和运行容器；Desktop 另提供桌面管理界面 |
| Docker Compose | 定义和启动多容器应用 |
| kubectl | Kubernetes 集群资源管理 |
| Apache Maven | Java 项目依赖管理、编译、测试和打包 |

## 数据库与浏览器

| 工具 | 主要用途 |
| --- | --- |
| MySQL | 存储数据，执行 SQL 查询 |
| Navicat | 连接数据库，查看表结构，执行查询和导入导出 |
| Chrome、Edge、Firefox | 调试页面、查看网络请求，检查网页在不同浏览器中的表现 |
