---
id: git-常用命令速查手册
title: Git 常用命令速查手册
excerpt: Git 常见操作：从配置、提交到分支、远程仓库与回滚。
category: study
date: 2026-08-20
status: published
accent: orange
---

# Git 常用命令速查手册

## 一、基础配置

```bash
git config --global user.name "你的名字"
git config --global user.email "you@example.com"
git config --global --list
```

## 二、仓库初始化与克隆

```bash
git init
git clone <仓库地址>
git remote -v
```

## 三、文件状态与暂存

```bash
git status
git add <文件名>
git add .
git restore <文件名>
git restore --staged <文件名>
```

## 四、提交与日志

```bash
git commit -m "feat: 描述这次改动"
git log --oneline --decorate --graph -20
git show <提交SHA>
```

## 五、分支管理

```bash
git branch
git switch -c <新分支名>
git switch main
git merge <分支名>
git branch -d <分支名>
```

## 六、远程仓库操作

```bash
git remote add origin <仓库地址>
git pull --rebase origin main
git push -u origin main
git push origin <分支名>
```

遇到远程已有提交时，先拉取、解决冲突、确认状态，再推送；不要用强制推送覆盖自己不理解的历史。

## 七、撤销与回滚

```bash
# 撤销未提交的工作区修改
git restore <文件名>

# 新建一个“反向提交”来撤销已发布提交（协作仓库优先使用）
git revert <提交SHA>

# 查看以前版本，不修改分支
git switch --detach <提交SHA>
```

## 八、暂存修改

```bash
git stash push -m "临时保存"
git stash list
git stash pop
```

## 九、忽略文件

把本机秘密和生成物写入 `.gitignore`：

```gitignore
.env
*.pem
data/
node_modules/
dist/
```

> Git 记录的是可共享的项目历史；密码、私钥、令牌和数据库永远不应进入提交。
