---
id: git-常用命令速查手册
title: Git 常用命令速查手册
excerpt: 按操作查 Git 命令：查看改动、提交、切换分支、同步远程仓库，以及撤销和临时保存修改。
category: study
illustration: programmer
date: 2026-08-20
updated: 2026-10-17
status: published
accent: orange
---

`<文件名>`、`<仓库地址>` 等是占位符，使用时替换成实际值，不保留尖括号。各节列的是不同操作，按需要选择命令。

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
git diff
git add <文件名>
git add .
git diff --cached
git restore --staged <文件名>
```

`git diff` 查看未暂存的改动，`git diff --cached` 查看准备提交的改动。`restore --staged` 取消暂存，文件中的修改仍然保留。

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

远程存在本地尚未包含的提交时，拉取并处理冲突后再推送。强制推送会改写远程分支历史。

## 七、撤销与回滚

```bash
# 丢弃指定文件中尚未暂存的修改
git restore <文件名>

# 新建一个“反向提交”来撤销已发布提交（协作仓库优先使用）
git revert <提交SHA>

# 查看以前版本，不修改分支
git switch --detach <提交SHA>
```

## 八、临时保存修改

```bash
git stash push -m "临时保存"
git stash list
git stash pop
```

## 九、忽略文件

在 `.gitignore` 中列出不需要提交的文件或目录，例如本地配置、依赖和构建结果：

```gitignore
.env
*.pem
data/
node_modules/
dist/
```

密码、私钥、令牌和含有个人数据的数据库文件不应提交到远程仓库。
