---
id: playwright-testagent-research
title: Playwright Test Agents 调研：方案比较与测试记录
excerpt: 比较截图操作、浏览器命令与测试代理，记录软件学院官网和 163 邮箱登录页的测试过程、生成文件与报告结果。
category: study
illustration: programmer
date: 2026-07-15
updated: 2026-10-17
status: published
accent: blue
contentType: article
tech:
  - Playwright
  - TypeScript
  - AI Agent
  - GUI Testing
---

这次调研比较了四种浏览器自动化方案，关注三个问题：怎样找到页面上的元素，执行后留下什么文件，以及这些操作能否变成可重复运行的测试。实验使用大连理工大学软件学院官网和 163 邮箱登录页，下面保留了当时的操作截图与结果。

![Playwright Test Agents 与项目适用性分析汇报封面](/uploads/2026/playwright-testagent/01-cover.png)

## 一、研究对象

调研涉及四类方案。它们都能驱动浏览器，但定位并不相同。

| 方案 | 怎样操作页面 | 本次关注的内容 |
| --- | --- | --- |
| 视觉 GUI Agent | 根据截图决定鼠标、键盘或浏览器动作 | 前期项目的定位方式与执行过程 |
| Codex Computer Use | 读取截图和界面信息，再调用操作工具 | 通用界面操作能否完成演示任务 |
| Playwright CLI | Agent 调用浏览器命令，读取页面状态和执行结果 | 如何将逐步操作保存为测试代码 |
| Playwright Test Agents | 分别规划测试、生成代码和处理失败 | 测试计划、代码和报告是否便于检查与复用 |

![四类研究对象及其定位](/uploads/2026/playwright-testagent/02-research-scope.png)

这几种方案可以配合使用。例如，Agent 用浏览器工具探索页面，再把确定的步骤写成 Playwright 测试文件。

## 二、前期方案：视觉 GUI Agent

前期项目 `GUIAutoTest_2.0.7` 采用截图、多模态模型与 Selenium/Playwright 结合的方式：先让模型理解当前页面，再生成鼠标点击、键盘输入或浏览器操作。

![前期 GUI 自动化项目与 163 邮箱登录页实验](/uploads/2026/playwright-testagent/03-previous-project.png)

截图定位可以处理一些难以从 DOM 或无障碍树中找到的目标。代价是每轮都要重新观察页面，分辨率、窗口位置和页面布局变化也可能影响定位。

前期方案主要完成点击、输入和跳转。要用它做回归测试，还需要保存测试步骤、补充断言，并处理重复运行时的环境问题。原汇报没有列出统一条件下的耗时或模型调用统计，因此还不能据此比较几种方案的速度与成本。


## 三、Codex Computer Use 演示

这次演示中的操作过程是：

1. 接收自然语言任务；
2. 获取截图和可用的界面信息；
3. 由模型判断下一步操作；
4. 使用 UI Automation 或系统输入完成点击、输入等动作；
5. 再次截图并验证结果，必要时继续修正。

![Codex Computer Use 的操作流程与实验画面](/uploads/2026/playwright-testagent/04-codex-computer-use.png)

演示记录了模型根据当前界面继续操作的过程。在浏览器里，除了截图，还可以利用按钮名称、文字和角色等信息定位目标。

这些记录能帮助检查某次操作是否完成。如果要在页面更新后重新执行同一组检查，还需要把步骤和预期结果写成测试，并保存运行报告。


## 四、Playwright CLI 与测试命令

原汇报图中放了两类命令，需要分开看：

- `playwright-cli open`、`snapshot`、`click`、`fill` 等命令供 Agent 逐步操作浏览器，见 [playwright-cli 项目说明](https://github.com/microsoft/playwright-cli)。
- `npx playwright test` 用于运行测试文件，`npx playwright show-report` 用于打开测试报告，见 [Playwright 命令行文档](https://playwright.dev/docs/test-cli)。

从探索页面到运行测试，过程如下：

```text
自然语言测试任务
  → Agent 制订步骤
  → CLI 执行 open / snapshot / click / fill 等操作
  → Agent 根据页面状态和操作结果编写测试与断言
  → npx playwright test 运行测试
  → 按配置保存截图、Trace 和测试报告
```

![Playwright CLI 在测试系统中的数据流](/uploads/2026/playwright-testagent/05-playwright-cli.png)

命令执行成功，只说明这条命令完成了。测试是否检查到了需求，要看生成的代码里有哪些断言；报告、截图和 Trace 则用于回查执行过程。

## 五、Planner、Generator 和 Healer

[Playwright Test Agents](https://playwright.dev/docs/test-agents) 将测试规划、代码生成和失败修复分别交给三类代理：

| Agent | 输入 | 主要产物 | 职责 |
| --- | --- | --- | --- |
| Planner | 需求、站点和种子测试 | `specs/*.md` | 浏览页面、拆分场景、编写测试计划 |
| Generator | 测试计划与页面状态 | `tests/*.spec.ts` | 生成可执行测试与断言，并实时校验定位器 |
| Healer | 失败日志、Trace、现有测试 | 修复后的测试代码 | 分析失败原因、修改代码并重新执行 |

![Planner、Generator 与 Healer 的协作方式](/uploads/2026/playwright-testagent/06-test-agents.png)

以 163 邮箱登录页为例，工作流可以表示为：

```text
自然语言需求
  → Planner 生成 specs/163-login.md
  → Generator 生成 tests/163-login.spec.ts
  → Playwright 执行并输出 Trace / Report
  → 失败时交给 Healer 分析、修复和重跑
```

测试计划和 TypeScript 文件都能单独打开检查，也能提交到仓库保存。下一次运行时，可以直接执行已有测试，不必重新从自然语言任务开始。

它主要面向浏览器测试；遇到 Canvas、远程桌面或缺少语义信息的界面时，仍可能需要视觉定位方案补充。

## 六、各阶段需要检查什么

![Playwright Test Agents GUI 自动化测试完整工作流](/uploads/2026/playwright-testagent/07-workflow.png)

生成文件后，还需要检查计划和代码是否符合原来的测试目标。

### 1. 测试规划

查看 Planner 的计划是否写清前置条件、操作步骤和预期结果。只有“点击提交”而没有提交后的预期结果，还不足以判断功能是否正确。

### 2. 代码生成

对照计划检查 `.spec.ts` 文件。除了定位器能否找到元素，还要看断言检查的是元素存在、元素可见，还是业务结果已经发生。

### 3. 执行与修复

失败后结合日志、截图和 Trace 查原因，再检查 Healer 修改了什么。如果它删掉断言或跳过了用例，报告变绿也不能说明问题已经解决。[官方说明](https://playwright.dev/docs/test-agents#-healer)也提到，Healer 判断功能有问题时可能跳过测试。

### 4. 版本管理与 CI/CD

把计划和测试代码提交到仓库，将报告与对应提交关联。接入 CI/CD 后，还要配置浏览器、测试数据和所需的登录状态。

## 七、实际操作记录

2026 年 7 月 6 日的软件学院官网测试记录了以下内容：

- 第一轮整理 50 条人工测试用例，覆盖页面、导航、搜索、内容、响应式和安全相关检查，共涉及 12 个功能模块；
- 第二轮记录 15 步点击流，并保存 22 张截图与操作日志，用于逐页验证主要导航路径；
- 第三轮整理页面路由，并设计 3 条端到端测试流程，涉及搜索、浏览跳转和三种分辨率对比；
- 最终整理出 29 个结果文件，约 27 MB。

![软件学院官网的点击流记录与自动化测试总结](/uploads/2026/playwright-testagent/08-practice.png)

163 邮箱登录页实验保留了 Planner 生成的计划和 Generator 生成的 TypeScript 文件。下面右下角是软件学院官网在有头 Chromium 中运行时的截图日志。

![Planner 计划、Generator 测试代码与有头浏览器日志](/uploads/2026/playwright-testagent/09-generated-artifacts.png)

163 邮箱示例的报告记录于 2026 年 7 月 6 日：共 10 条测试，10 条通过，失败、Flaky 和跳过项均为 0，总用时约 1.1 分钟。截图中能读到的用例包括：

- 登录页面加载和基础结构检查；
- 登录容器与关键元素可见性；
- iframe 中的邮箱、密码输入；
- 登录方式切换。

截图底部还能看到表单提交校验文件，具体用例没有完整显示。

![163 邮箱示例的 Playwright HTML 测试报告](/uploads/2026/playwright-testagent/10-report.png)

这次实验留下了可检查的计划、测试代码和报告，说明这套流程在这些样例上能够运行。10 条用例全部通过，只能说明本次执行满足了代码中的断言；完整登录业务是否覆盖、换一批页面是否仍然稳定，还需要更多测试记录。
