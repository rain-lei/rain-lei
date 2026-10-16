---
id: blockchain-first-meeting-2026
title: 区块链组 2026 年第一次例会：网页开发流程与 Git 入门
excerpt: 用任务清单了解前端、后端和数据库如何配合，启动本地项目，并向例会仓库提交第一个 Pull Request。
category: study
date: 2026-10-17
status: published
accent: blue
tech:
  - 区块链组
  - 例会
  - Web 开发
  - Git
  - GitHub
---

这次例会用一个任务清单讲网页开发：在页面里输入“学习 Git”，点击保存，刷新后还能看到这条任务。沿着这次操作，可以看清前端、后端和数据库分别做了什么。

后半部分是 Git 协作练习。每个人把练习仓库 Fork 到自己的账号，新增一个文本文件，再向原仓库提交 Pull Request（PR）。本文根据《开发全流程入门教程》整理，命令以 Windows PowerShell 为例。

需要用到的材料：

- [例会练习仓库：rain-lei/BlockChain_GIt_2026](https://github.com/rain-lei/BlockChain_GIt_2026)
- [任务清单演示项目下载](/uploads/2026/blockchain-first-meeting/task-demo.zip)，解压后进入 `task-demo` 文件夹。

任务清单用于观察网页请求，需要 Python 3.10 或以上版本。Fork 与 PR 练习只用 Git、GitHub 账号和文本编辑器，可以单独完成。

## 网页里的“保存”是怎么完成的

### 前端、后端和数据库

任务清单的页面上有一个输入框和一个保存按钮。它们属于前端，运行在浏览器里。HTML 定义页面结构，CSS 负责样式，JavaScript 处理点击和请求。

点击保存后，浏览器把任务标题发给后端。后端先检查标题是否有效，再把它写入数据库，最后把保存结果返回给浏览器。前端收到结果后更新列表。

| 部分 | 在这个例子里做什么 |
| --- | --- |
| 前端 | 显示输入框、发送标题、展示任务列表 |
| 后端 | 接收请求、检查标题、读写任务数据 |
| 数据库 | 保存任务编号 `id` 和标题 `title` |

这里的数据库是 SQLite，数据保存在项目目录中的 `tasks.db` 文件里。后端写入成功后，即使刷新页面，任务也还在。

浏览器是客户端，后端程序提供服务。本地练习时，两者可以运行在同一台电脑上。

### API 约定了请求方式和数据格式

前端需要知道把标题发到哪里、用什么格式发送，以及如何判断保存结果。这些约定就是接口的一部分。

演示项目提供了两个任务接口：

| 请求 | 用途 | 成功时的响应 |
| --- | --- | --- |
| `GET /api/tasks` | 获取任务列表 | `200`，返回包含 `items` 数组的 JSON |
| `POST /api/tasks` | 新增任务 | `201`，返回新任务的 `id` 和 `title` |

保存“学习 Git”时，请求正文是：

```json
{
  "title": "学习 Git"
}
```

保存成功后，响应正文类似这样：

```json
{
  "id": 1,
  "title": "学习 Git"
}
```

`1` 是示例编号，实际值取决于数据库中已有的数据。再次获取列表时，会看到：

```json
{
  "items": [
    { "id": 1, "title": "学习 Git" }
  ]
}
```

如果标题是空字符串或只有空格，后端会返回 `400` 和错误说明，不会新增任务。

### HTTP 请求和响应

HTTP 请求包含方法、请求地址、头部，以及可能存在的正文。响应包含状态码、响应头和响应正文。

以获取列表为例，下面用 HTTP/1.1 的形式展示主要字段，省略了其他头部：

```http
GET /api/tasks HTTP/1.1
Host: localhost:8000
```

响应示例：

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"items":[{"id":1,"title":"学习 Git"}]}
```

这个 GET 请求没有正文。新增任务时，前端使用 POST，并用 `Content-Type: application/json` 说明正文采用 JSON 格式。

## 启动本地项目

### 项目文件

下载并解压演示项目后，先看 `README.md`，再对照下面的文件结构：

```text
task-demo/
├── README.md
├── requirements.txt
├── app.py
├── templates/
│   └── index.html
├── tests/
│   └── test_app.py
└── .gitignore
```

`app.py` 用 Flask 定义接口，处理标题校验和数据库读写。`templates/index.html` 是任务清单页面，其中的 JavaScript 负责发送请求。`requirements.txt` 列出了需要安装的 Python 依赖。

`tests/test_app.py` 检查正常标题、空标题和错误参数的处理结果。`tasks.db` 会在启动时生成，不包含在下载包里。

### 在 PowerShell 中运行

在 `task-demo` 文件夹打开 PowerShell，依次执行：

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m flask --app app run --debug --port 8000
```

第一条命令创建虚拟环境，第二条安装依赖，第三条启动本地服务。这里直接调用虚拟环境中的 Python，不需要额外执行激活脚本。

终端显示 `Running on http://127.0.0.1:8000` 后，在浏览器打开 `http://localhost:8000`。运行期间保留这个终端，结束时按 `Ctrl+C`。

macOS 或 Linux 可以用 `python3 -m venv .venv` 创建环境，再把后续命令中的 `.\.venv\Scripts\python.exe` 换成 `.venv/bin/python`。

`--debug` 用于本地调试，修改代码后服务会自动重载。正式部署需要按 [Flask 的部署说明](https://flask.palletsprojects.com/en/stable/deploying/)配置服务。

### localhost、端口和路径

把 `http://localhost:8000/api/tasks` 拆开看：

| 部分 | 含义 |
| --- | --- |
| `http` | 使用 HTTP 协议 |
| `localhost` | 当前这台电脑 |
| `8000` | 本例后端监听的端口 |
| `/api/tasks` | 任务接口的路径 |

打开 `/` 会看到网页，打开 `/api/tasks` 会看到任务列表的 JSON。它们由同一个本地服务提供。

### 在 Network 中查看请求

页面打开后，按 `F12` 进入开发者工具，切换到 **Network**。输入“学习 Git”并保存，然后在请求列表中找到方法为 POST 的 `/api/tasks`。

依次查看：

1. **Headers**：核对请求地址、请求方法和状态码。本例保存成功时是 `201`。
2. **Payload**：查看发出的 `title`，确认内容与输入框一致。
3. **Response**：查看后端返回的任务编号和标题。

![Chrome DevTools 的 Network 面板与请求详情入口](/uploads/2026/blockchain-first-meeting/network-panel.png)

上图是课件采用的 [Chrome 官方界面示例](https://developer.chrome.com/docs/devtools/network/reference)，用于说明请求列表和详情标签的位置。图中显示的是 GET 请求，跟做时要选择任务清单发出的 POST 请求。

保存成功后，前端还会再发一次 GET 请求来更新列表，所以同一路径可能出现多条记录。

### 根据报错位置排查

如果页面没有显示预期结果，先看请求是否发出，再看状态码和响应内容。

| 状态码 | 常见含义 | 先检查哪里 |
| --- | --- | --- |
| `2xx` | 请求成功 | 响应数据是否正确，前端是否更新了页面 |
| `400` / `422` | 请求参数有问题 | 必填字段、类型和格式。任务清单的标题校验使用 `400` |
| `401` / `403` | 认证或权限问题 | 登录状态和账号权限 |
| `404` | 没有找到对应资源 | 请求路径是否写对 |
| `500` | 后端内部错误 | 后端终端中的异常、文件名和行号 |

任务清单可以做两次简单检查：输入正常标题应保存成功，输入空格应显示错误。保存后刷新页面，确认数据仍然存在。

项目也提供了接口测试。在项目目录另开一个终端运行：

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

如果要观察后端异常，可以访问本地的 `http://localhost:8000/api/demo/error`，再回到终端查看 `app.py` 中的报错位置。这个接口专门用于课堂演示，会主动抛出异常。

## Git 的准备工作

Git 用来保存文件的修改历史，GitHub 则可以托管仓库，供大家协作。这次练习会在本地提交修改，再把修改推送到 GitHub。

### 安装并验证 Git

在 [Git 官方下载页](https://git-scm.com/install/)选择适合自己系统的安装方式。Windows 安装完成后，关闭旧终端再重新打开，执行：

```bash
git --version
```

看到版本号就说明终端能够找到 Git，数字不必与课件截图相同。可以使用 PowerShell，也可以从开始菜单打开 Git Bash。

如果提示找不到 `git`，先重新打开终端。仍有问题时，检查安装时的 PATH 设置，或者先在 Git Bash 中验证。

### 设置提交者信息

把命令中的名字和邮箱换成自己的信息，保留英文双引号：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

查看配置结果：

```bash
git config --global user.name
git config --global user.email
```

`--global` 对当前电脑用户生效，通常配置一次即可。姓名和邮箱会写进提交记录，邮箱可以使用 GitHub 已关联的邮箱或 GitHub 提供的 noreply 邮箱。配置方法见 [Git 官方说明](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)。

这些信息用于标记提交作者。向 GitHub 推送时，还需要通过 GitHub 的登录认证。

### add、commit 和 push 分别做什么

| 位置 | 内容 | 对应操作 |
| --- | --- | --- |
| 工作区 | 电脑上正在编辑的文件 | 用编辑器修改、保存 |
| 暂存区 | 准备放进下一次提交的修改 | `git add` |
| 本地仓库 | 已经保存的提交记录 | `git commit` |
| 个人 Fork | GitHub 上自己账号下的仓库 | `git push` |

保存文件后，Git 还没有生成提交。执行 `commit` 后，修改也仍然只在本地，直到 `push` 成功才会出现在 GitHub 上。

## 向例会仓库提交第一个 PR

本次使用的原仓库是 [rain-lei/BlockChain_GIt_2026](https://github.com/rain-lei/BlockChain_GIt_2026)。Fork 会在自己的 GitHub 账号下建立一份仓库，clone 则把仓库下载到本机。完成修改后，通过 PR 请求负责人把它合并到原仓库。

下面保留了课件里的操作截图。截图中的账号和分支属于演示示例，跟做时使用自己的账号，练习分支统一命名为 `practice/first-pr`。

### 1. Fork 到自己的账号

登录 GitHub，打开原仓库，点击右上角的 **Fork**。在创建页面确认 **Owner** 是自己的账号，再点击 **Create fork**。

![创建 Fork 时选择自己的账号作为 Owner](/uploads/2026/blockchain-first-meeting/create-fork.png)

完成后会进入自己账号下的 `BlockChain_GIt_2026` 仓库。

### 2. 克隆自己的 Fork，并创建分支

在自己的 Fork 页面点击 **Code**，选择 **HTTPS**，复制克隆地址。

![在自己的 Fork 页面打开 Code 菜单](/uploads/2026/blockchain-first-meeting/clone-address.png)

在准备保存项目的文件夹打开终端，执行下面的命令。`YOUR_USERNAME` 要替换为自己的 GitHub 用户名。

```bash
git clone https://github.com/YOUR_USERNAME/BlockChain_GIt_2026.git
cd BlockChain_GIt_2026
git switch -c practice/first-pr
```

这三步分别是下载仓库、进入仓库目录、创建并切换到练习分支。后续命令都在这个仓库目录中执行。

### 3. 新增一个文本文件

用记事本或写字板输入自己喜欢的内容，保存为纯文本文件。文件名可以自定，建议包含自己的用户名，方便区分。

例如，新建 `your-name.txt`，内容可以是一句自我介绍。把它放在仓库目录里，保留其他同学的文件。

先检查 Git 识别到的修改：

```bash
git status
```

确认只有自己的练习文件后，暂存并提交：

```bash
git add .
git diff --cached
git commit -m "add hello world"
```

`git add .` 会暂存当前目录下未被忽略的修改，所以先用 `git status` 看文件范围。`git diff --cached` 可以检查准备提交的具体内容，确认无误后再执行 `commit`。

### 4. 推送到自己的 Fork

```bash
git push -u origin practice/first-pr
```

这里的 `origin` 应指向自己的 Fork。首次推送如果要求认证，按提示登录 GitHub。

推送成功后，打开自己的 Fork，切换到 `practice/first-pr` 分支，确认能看到刚保存的文件。

如果出现权限错误，可以先检查远程地址：

```bash
git remote -v
```

地址里的用户名应是自己的账号。克隆成原仓库时，需要先把远程地址改为自己的 Fork，再重试推送。

### 5. 选择 PR 的来源和目标

推送后，GitHub 通常会出现 **Compare & pull request** 按钮。

![推送分支后出现的 Compare & pull request 入口](/uploads/2026/blockchain-first-meeting/compare-pull-request.png)

如果没有这个按钮，打开原仓库的 **Pull requests**，点击 **New pull request**，再选择 **compare across forks**。

创建前核对这四项：

| 字段 | 本次应选择的值 |
| --- | --- |
| base repository | `rain-lei/BlockChain_GIt_2026` |
| base | `main` |
| head repository / head fork | 自己账号下的 `BlockChain_GIt_2026` |
| compare | `practice/first-pr` |

**base 是要接收修改的分支，head / compare 是自己提交修改的分支。** 界面上的字段名称可能略有变化，合并方向以这张表为准。GitHub 的[从 Fork 创建 PR 文档](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)也说明了这组对应关系。

### 6. 检查差异并提交

查看差异列表，确认只包含自己的练习文件，内容与本地保存的一致。点击 **Create pull request** 后，标题可以写“第一次 PR”，说明里写清楚新增了哪个文件。

例如：

```text
新增 your-name.txt，内容是我的例会练习。
已检查差异，只新增了自己的文件。
```

这段说明里的文件名要按实际修改填写。再次点击 **Create pull request**，提交这个 PR。

### 7. 确认创建成功

在原仓库看到自己的 PR 页面，状态为 **Open**，并且有 PR 编号，就完成了这次练习。再到 **Files changed** 检查一次提交的文件，保存好 PR 链接，等待负责人审核。

![课件中的 PR 创建成功示例，页面显示 Open 状态和 PR 编号](/uploads/2026/blockchain-first-meeting/pull-request-open.png)

截图里的 `zhh` 是演示分支。本次练习仍使用 `practice/first-pr`，不需要等到 PR 合并才算完成。

## 项目上线时还要处理什么

### 开发、测试和生产环境

前面的任务清单运行在本机，属于开发环境。正式项目通常还会区分测试环境和生产环境。

| 环境 | 主要用途 | 使用的数据 |
| --- | --- | --- |
| 开发环境 | 写代码、调试 | 本地样例数据 |
| 测试环境 | 检查接口配合和完整业务流程 | 测试数据 |
| 生产环境 | 向实际用户提供服务 | 正式数据 |

一次修改在本机跑通后，还要经过测试和评审，才能进入正式发布流程。

### 构建、部署和回滚

构建会把源码处理成可以运行或发布的产物，例如前端静态文件、程序或容器镜像。部署则把对应版本放到目标环境，配置并运行它。

前端上线后，要检查 HTML、CSS、JavaScript 等资源是否加载，以及 API 地址是否正确。后端还要安装依赖、配置环境变量，并确认数据库连接和接口响应。

如果新版本出现影响使用的问题，需要结合日志判断原因。必要时按项目的发布方案恢复旧版本，同时考虑数据库结构和数据的兼容性。

### 线上页面里的 localhost

本地开发时，请求 `http://localhost:8000` 会访问自己电脑上启动的后端。

页面部署给别人访问以后，浏览器里的 `localhost` 指向访问者自己的电脑。因此，线上前端需要使用实际可访问的后端地址。

如果前后端共用一个域名，并由服务器把 `/api` 转发给后端，前端也可以继续使用 `/api/tasks` 这样的相对路径。课件里的 `api.example.com` 只是示例地址。

### 发布后的功能检查

仍然以任务清单为例：打开正式页面，保存一条任务，再刷新页面，确认任务还能读出来。

遇到 `400` 时先看提交参数和返回说明，可能只是标题没有通过校验。遇到 `500` 时查看后端日志。即使接口返回 `201`，也要继续确认页面显示和数据读取是否正常。

## 本次练习的提交要求

最后提交自己的 PR 链接，并核对以下内容：

- PR 在 `rain-lei/BlockChain_GIt_2026` 原仓库中。
- 来源是自己的 Fork 的 `practice/first-pr` 分支，目标是原仓库的 `main`。
- **Files changed** 中只包含自己的练习文件。
- PR 已成功创建，页面有编号，可以等待负责人审核。

后续查命令时，可以看站内的 [Git 常用命令速查手册](/articles/git-常用命令速查手册/)。任务清单的启动和测试命令，也保留在[演示项目](/uploads/2026/blockchain-first-meeting/task-demo.zip)的 `README.md` 中。
