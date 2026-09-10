---
id: oureda-winter-wordle
title: OurEDA Winter Wordle
excerpt: OurEDA 25 级 Web 方向寒假作业：使用原生 HTML、CSS 和 JavaScript 实现的五字母猜词小游戏，可直接在线试玩。
category: entertainment
date: 2026-01-18
status: published
accent: green
contentType: game
playUrl: https://rain-lei.github.io/oureda-25-web-winter/
repository: https://github.com/rain-lei/oureda-25-web-winter
tech:
  - HTML
  - CSS
  - JavaScript
  - GitHub Pages
---

# OurEDA Winter Wordle

OurEDA 25 级 Web 方向寒假作业，使用原生 HTML、CSS 和 JavaScript 实现五字母猜词游戏。

## 玩法

每局会随机选择一个五字母英文单词。玩家有六次猜测机会，每次提交后方格会使用颜色反馈结果：

- 绿色：字母和位置都正确；
- 黄色：答案包含这个字母，但位置不正确；
- 灰色：答案中不存在这个字母。

页面同时支持屏幕键盘和实体键盘操作，并提供删除、提交、刷新与显示答案功能。

## 实现内容


1. 使用 DOM 将程序状态同步到页面；
2. 管理最多六轮猜测的游戏生命周期；
3. 校验输入单词并计算颜色序列；
4. 处理重复字母和位置匹配；
5. 让虚拟键盘与实体键盘使用同一套输入逻辑；
6. 使用 Git 保存开发过程，并通过 GitHub Pages 发布。

## 项目信息

- [在线试玩](https://rain-lei.github.io/oureda-25-web-winter/)
- [查看源码](https://github.com/rain-lei/oureda-25-web-winter)
- 技术栈：HTML、CSS、JavaScript
