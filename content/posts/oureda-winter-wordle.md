---
id: oureda-winter-wordle
title: OurEDA Winter Wordle
excerpt: OurEDA 25 级 Web 方向寒假作业。六次机会猜一个五字母单词，可以在页面里直接玩。
category: entertainment
illustration: wordle
date: 2026-01-18
updated: 2026-10-17
status: published
accent: green
contentType: game
playUrl: https://rain-lei.github.io/oureda-25-web-winter/
repository: https://github.com/rain-lei/oureda-25-web-winter/tree/website
tech:
  - HTML
  - CSS
  - JavaScript
  - GitHub Pages
---

这是用 HTML、CSS 和 JavaScript 写的 Wordle 小游戏。上面的窗口就能玩，也可以[单独打开游戏](https://rain-lei.github.io/oureda-25-web-winter/)。

## 玩法

每局随机选一个五字母英文单词，你有六次机会。输入单词并提交后，看方格颜色继续猜：

- 绿色：字母和位置都正确；
- 黄色：答案包含这个字母，但位置不正确；
- 灰色：这个字母没有匹配到答案；也可能是猜的重复字母比答案中的多。

可以点屏幕上的键盘，也可以直接用实体键盘输入。页面提供删除、提交、刷新和显示答案的按钮。

## 代码做了什么

JavaScript 保存当前输入、猜测次数和游戏状态，再更新方格和键盘。每次提交会检查单词、判断字母位置，并决定这局是否结束：猜中就获胜，六次都没猜中则结束。

字母重复出现时，先匹配位置正确的字母，再判断剩余字母是否出现在答案里，避免一个字母被重复计算。两种键盘提交后都调用同一个判断函数，页面通过 GitHub Pages 发布。

## 项目信息

- [在线试玩](https://rain-lei.github.io/oureda-25-web-winter/)
- [查看源码（website 分支）](https://github.com/rain-lei/oureda-25-web-winter/tree/website)
