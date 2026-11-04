# rain 的博客动效笔记

| 看过的设计 | 在博客里怎么用 |
| --- | --- |
| Anthony Fu 用 SVG 描出自己的签名，也写过博客标题轻轻滑入的做法。[签名](https://antfu.me/posts/animated-svg-logo) · [入场](https://antfu.me/posts/sliding-enter-animation) | 首次打开首页时，`rain` 下方原有的笔画从左向右画出。打开文章时只有标题轻移 5px，正文可以立刻阅读。 |
| Josh W. Comeau 把悬停反馈放在可交互的元素上，读者移过链接就知道它能点。[悬停示例](https://www.joshwcomeau.com/snippets/html/scale-with-pseudoelements/) | 文章卡片保持原位，标题出现细下划线，箭头稍向右移。用 Tab 选中文章也能看见下划线。 |
| Emil Kowalski 根据操作频率决定是否运行动画，特别强调键盘输入要即时响应。[You Don't Need Animations](https://emilkowal.ski/ui/you-dont-need-animations) | 点分类时，仍在视野内的卡片用 180ms 移到新位置。输入关键词或用键盘选分类，立即显示结果。 |
| Hakim El Hattab 用贴着目录移动的线标出屏幕上的章节。[Progress Nav](https://hakim.se/progress-nav/) | 桌面目录用一条短线跟随当前章节。手机读到正文时，用原有顶栏显示章节名，点「目录」就能换节。 |

首页首屏以下的文章、项目和友链在滚到时各自轻移一次。站内暂停开关和系统“减少动态效果”都可关闭这些动画。刷新、返回上一页或从锚点打开文章时，直接呈现标题，保留阅读位置。

学校和专业放在「关于」页。读者从文章署名就能点进作者资料，联系方式直接列出邮箱地址与 GitHub 账号。
