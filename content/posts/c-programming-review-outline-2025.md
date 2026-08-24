---
id: c-programming-review-outline-2025
title: C 程序设计复习提纲（2025）
excerpt: 按数据结构、表达式、控制结构、函数与指针整理 C 语言复习范围，并归纳阅读代码、程序填空、程序设计和综合设计题的检查重点。
category: study
date: 2025-11-19
status: published
accent: green
contentType: article
tech:
  - C
  - 数据结构
  - 算法
---

# C 程序设计复习提纲（2025）

## 一、整体知识框架

C 程序设计的复习内容可以分成两条主线：

| 主线 | 核心内容 |
| --- | --- |
| 数据结构 | 基本类型、数组、结构体、指针、文件 |
| 算法 | 表达式、选择结构、循环结构、函数 |

程序就是使用合适的数据结构组织数据，再使用算法完成输入、处理和输出。指针贯穿数组、字符串、结构体与函数传参，是两条主线之间的重要连接点。

## 二、数据类型与输入输出

### 1. 关键字与标识符

- 熟悉常用关键字；
- 掌握变量名、函数名等标识符的命名规则；
- 标识符只能由字母、数字和下划线组成，且不能以数字开头；
- 关键字不能作为标识符；
- C 语言区分大小写。

### 2. 基本数据类型

需要理解常用类型的描述符号、表达范围和存储方式：

| 类型 | 常见用途 | 常用输入输出格式 |
| --- | --- | --- |
| `char` | 字符、小整数 | `%c` |
| `int` | 整数 | `%d` |
| `float` | 单精度小数 | `%f` |
| `double` | 双精度小数 | `scanf` 使用 `%lf`，`printf` 通常使用 `%f` |

还要区分变量与常量，掌握各类变量的定义、初始化和赋值方法。

### 3. 输入输出

重点掌握：

- `printf` 的格式化输出；
- `scanf` 的格式化输入以及地址符 `&`；
- 字符输入输出；
- 输入缓冲区、格式符不匹配等常见问题；
- 格式化 I/O 的基本含义。

## 三、数组

### 1. 一维数组

- 理解连续存储的特点；
- 掌握定义、初始化和元素访问；
- 区分数组定义与数组元素引用；
- 长度为 `n` 的数组，下标范围是 `0` 到 `n - 1`；
- 避免越界访问。

```c
int a[5] = {1, 2, 3, 4, 5};

for (int i = 0; i < 5; i++) {
    printf("%d ", a[i]);
}
```

### 2. 二维数组

二维数组可以理解为“一维数组组成的一维数组”，在 C 语言中按行优先顺序存储。

```c
int matrix[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
```

需要掌握：

- 定义与初始化；
- 使用 `matrix[i][j]` 访问元素；
- 使用双重循环遍历；
- 向函数传递二维数组时，除第一维外通常需要给出后续维度。

### 3. 字符数组与字符串

- 字符串以空字符 `\0` 结束；
- 字符数组不一定天然就是合法字符串；
- 掌握字符数组的定义、初始化、整体访问和局部访问；
- 理解字符数组与普通 `char` 数组的联系和区别。

```c
char word[] = "hello";  // 实际包含 6 个字符，最后一个是 '\0'
```

### 4. 数组常见算法

- 排序：冒泡排序、选择排序；
- 查找：线性查找、二分查找；
- 统计：最大值、最小值、总和与平均值；
- 元素移动、交换与逆序；
- 二分查找要求数据已经按顺序排列。

## 四、结构体

### 1. 基本概念

结构体用于把不同类型、但属于同一对象的数据组织在一起。

```c
typedef struct {
    char name[50];
    double price;
} Book;
```

### 2. 复习重点

- 声明结构体类型；
- 定义并初始化结构体变量；
- 定义结构体数组；
- 使用 `.` 访问结构体成员；
- 使用 `->` 访问结构体指针指向对象的成员；
- 向函数传递结构体值或结构体地址；
- 理解传值和传址在复制成本、修改效果上的区别。

## 五、运算符与表达式

### 1. 算术运算

- 整数除法会舍去小数部分；
- 除数不能为 0；
- `%` 用于整数求余；
- 注意不同数据类型参与运算时的结果类型。

### 2. 赋值

- 区分赋值运算符 `=` 与相等判断 `==`；
- 掌握 `+=`、`-=`、`*=`、`/=` 等复合赋值；
- 赋值表达式本身也有值。

### 3. 自增与自减

```c
int a = 3;
int b = a++;  // b 为 3，随后 a 变为 4
int c = ++a;  // a 先变为 5，c 为 5
```

需要区分前置和后置形式，避免在同一个复杂表达式中多次修改同一变量。

### 4. 关系与逻辑运算

- 关系运算：`<`、`<=`、`>`、`>=`、`==`、`!=`；
- 逻辑运算：`&&`、`||`、`!`；
- `&&` 和 `||` 具有短路特性；
- 构造条件时注意边界和括号。

### 5. 其他运算

- 逗号运算符；
- 条件运算符 `条件 ? 表达式1 : 表达式2`；
- `sizeof`；
- 强制类型转换；
- 混合运算中的隐式类型转换。

## 六、选择结构

### 1. `if` 与 `if-else`

掌握单选、双选与多选结构，注意 `else` 总是与它前面最近的、尚未匹配的 `if` 配对。

```c
if (score >= 90) {
    grade = 'A';
} else if (score >= 80) {
    grade = 'B';
} else {
    grade = 'C';
}
```

### 2. `switch`

```c
switch (choice) {
case 1:
    /* 分支一 */
    break;
case 2:
    /* 分支二 */
    break;
default:
    /* 其他情况 */
}
```

需要理解 `break` 的作用，以及没有 `break` 时继续进入后续分支的贯穿现象。

## 七、循环结构

### 1. 循环三要素

1. 循环初始条件；
2. 循环条件；
3. 循环体以及控制变量更新。

### 2. 三种循环

| 结构 | 特点 |
| --- | --- |
| `for` | 适合循环次数相对明确的情况 |
| `while` | 先判断条件，再执行循环体 |
| `do...while` | 先执行一次，再判断条件 |

还要掌握：

- 循环条件设计；
- 双重、三重循环；
- `break` 结束当前循环；
- `continue` 跳过本轮剩余语句；
- 防止死循环和下标越界。

## 八、函数

### 1. 定义、声明与调用

```c
int max_value(int a, int b);  // 函数原型

int max_value(int a, int b) {
    return a > b ? a : b;
}
```

重点掌握：

- 函数的作用与模块化思想；
- 返回类型、函数名、形式参数和函数体；
- 函数原型；
- 函数调用、嵌套调用和递归调用；
- 一个函数调用只能直接返回一个值。

### 2. 参数传递

C 语言的参数本质上都是值传递。传入指针时，复制的是地址值，因此函数可以通过这个地址修改调用者的数据。

| 写法 | 传入内容 | 能否直接修改调用者对象 |
| --- | --- | --- |
| `void f(int x)` | 整数值的副本 | 否 |
| `void f(int *p)` | 地址值的副本 | 可以通过 `*p` 修改 |
| `void f(int a[])` | 数组首元素地址 | 可以修改数组元素 |

## 九、指针

### 1. 基本概念

- `&x`：取得变量 `x` 的地址；
- `*p`：访问指针 `p` 指向的数据；
- 指针变量本身也需要定义和初始化；
- 不要解引用未初始化指针、空指针或已经失效的地址。

```c
int value = 10;
int *p = &value;
*p = 20;
```

### 2. 指针与数组

数组名在多数表达式中会转换为首元素指针：

```c
a[i] == *(a + i)
```

需要理解数组形参的本质，并掌握使用指针遍历一维数组。

### 3. 指针与字符串

熟悉 `<string.h>` 中的常用函数：

| 函数 | 作用 |
| --- | --- |
| `strlen` | 计算字符串长度，不包含 `\0` |
| `strcpy` | 复制字符串 |
| `strcat` | 拼接字符串 |
| `strcmp` | 按字典顺序比较字符串 |
| `strstr` | 查找子串 |

还要能够自定义简单字符串函数，并理解字符数组和字符指针存储字符串时的差异。

## 十、考试题型与分值

| 题型 | 数量 | 分值 | 主要检查内容 |
| --- | ---: | ---: | --- |
| 阅读代码题 | 5 题 | 25 分 | 跟踪变量、指针、循环和函数调用，写出输出 |
| 程序填空题 | 4 题 | 25 分 | 根据程序功能补全声明、调用、循环和返回值 |
| 程序设计题 | 4 题 | 40 分 | 根据功能描述设计算法并编写程序 |
| 面向过程程序分析与设计 | 1 题 | 10 分 | 设计数据类型和函数接口 |

## 十一、阅读代码题：指针作用域

题目中的函数让局部指针 `pMax`、`pMin` 指向数组中的最大值和最小值，并在函数内部交换两个指针。

对数组 `{1, 2, 3, 0, 5, 8}`，三次输出分别是：

```text
min = 8, max = 0
min = 0, max = 8
min = -1, max = -1
```

原因：

1. `pMax = pMin = a` 只修改函数内部的两个指针副本；
2. 循环结束后，它们分别指向数组中的 `8` 和 `0`；
3. 原程序第一条格式字符串把 `*pMax` 放在 `min` 后、把 `*pMin` 放在 `max` 后，因此显示标签与变量含义正好相反；
4. 交换局部指针后，第二行显示为 `min = 0, max = 8`；
5. 调用者的 `min`、`max` 从未通过 `*pMax`、`*pMin` 被赋值，所以仍为 `-1`。

阅读指针代码时，先区分“修改指针变量本身”和“修改指针指向的数据”。

## 十二、程序填空题

### 1. 求数组最大元素下标

正确的补全顺序是：

```c
int max_grade(int a[], int size);

index = max_grade(grade, 10);

max = a[i];
index = i;

return index;
```

完整核心函数：

```c
int max_grade(int a[], int size) {
    int max = a[0];
    int index = 0;

    for (int i = 1; i < size; i++) {
        if (a[i] > max) {
            max = a[i];
            index = i;
        }
    }
    return index;
}
```

### 2. 八进制字符串转十进制

输入字符串 `"556"`，对应十进制数：

```text
5 × 8² + 5 × 8¹ + 6 = 366
```

核心过程：

```c
n = *p - '0';

while (*(++p) != '\0') {
    n = n * 8 + *p - '0';
}
```

每读入一个新数字，原结果先乘 8，再加上当前数字。

实际编程时应优先使用 `fgets`，避免使用已经不安全、也已从新标准中移除的 `gets`。

## 十三、程序设计题方向

### 1. 自定义字符串比较

模拟 `strcmp` 的基本思路：

1. 从两串首字符开始比较；
2. 字符相等时同时后移；
3. 遇到不同字符时返回其无符号字符值之差；
4. 如果一串先结束，也由结束位置的字符差决定结果。

```c
int strcompare(const char *str1, const char *str2) {
    while (*str1 != '\0' && *str1 == *str2) {
        str1++;
        str2++;
    }
    return (unsigned char)*str1 - (unsigned char)*str2;
}
```

### 2. 查找 1 到 99 的同构数

同构数出现在其平方数的末尾。例如：

- `5² = 25`，末尾是 `5`；
- `25² = 625`，末尾是 `25`。

判断时根据原数位数选择模数：一位数取平方后的末一位，两位数取末两位。

```c
for (int n = 1; n <= 99; n++) {
    int mod = n < 10 ? 10 : 100;
    if ((n * n) % mod == n) {
        printf("%d ", n);
    }
}
```

### 3. 矩阵乘法

已知 `A` 为 `N × M`，`B` 为 `M × K`，则结果 `C` 为 `N × K`：

```c
for (int i = 0; i < N; i++) {
    for (int j = 0; j < K; j++) {
        c[i][j] = 0;
        for (int k = 0; k < M; k++) {
            c[i][j] += a[i][k] * b[k][j];
        }
    }
}
```

三个循环分别负责结果矩阵的行、列以及对应元素的累加。

## 十四、综合题：书籍管理与统计

### 1. 需求拆分

系统管理 5 本书，每本书包含：

- 书名 `name`；
- 价格 `price`；
- 3 位读者的评分 `scores`；
- 平均分 `avg_score`。

需要完成：

1. 输入书籍名称和价格；
2. 按书名查询，存在时返回下标，不存在时返回 `-1`；
3. 为指定书籍输入 3 个整数评分；
4. 计算并保存平均分；
5. 按平均分选出前三名并输出。

### 2. 数据类型设计

```c
#define MAX_BOOKS 5
#define MAX_NAME_LEN 50
#define READERS 3

typedef struct {
    char name[MAX_NAME_LEN];
    double price;
    int scores[READERS];
    double avg_score;
} Book;

Book books[MAX_BOOKS];
Book top3[3];
```

也可以把 `top3` 设计成指针数组，保存前三本书在 `books` 中的地址：

```c
Book *top3[3];
```

两种设计的区别是：前者复制整个结构体，后者只保存地址。

### 3. 函数接口

```c
void inputBooks(Book books[], int n);

int findBook(Book books[], int n, const char name[]);

int inputScore(Book *book);

void calculateAvgScore(Book *book);

void printTop3(Book books[], int n, Book top3[]);
```

函数职责：

| 函数 | 职责 |
| --- | --- |
| `inputBooks` | 输入并保存书籍信息 |
| `findBook` | 根据书名查找并返回下标 |
| `inputScore` | 为一本书录入 3 个评分 |
| `calculateAvgScore` | 计算一本书的平均分 |
| `printTop3` | 选出并输出平均分最高的 3 本书 |

### 4. 综合题检查清单

- 所有函数声明、定义和调用的参数数量保持一致；
- `books`、`book` 等变量名不要混用；
- 查找函数必须接收数组长度，避免越界；
- 输入书名可能含空格，应使用 `fgets` 并处理末尾换行；
- 评分需要检查是否为 `0` 到 `5` 的整数；
- 计算平均分时避免整数除法；
- 排序后不要破坏仍需使用的原始数据，或明确采用结构体复制/指针排序；
- 按题目要求处理并列情况。

## 十五、复习顺序

建议按依赖关系复习：

1. 数据类型、输入输出与表达式；
2. 选择结构和循环结构；
3. 一维数组、二维数组和字符串；
4. 函数定义、声明、调用和参数传递；
5. 指针、数组形参和字符串函数；
6. 结构体、结构体数组与结构体指针；
7. 排序、查找、统计和矩阵运算；
8. 最后集中练习代码阅读、程序填空与综合接口设计。

做代码阅读题时，建议逐行记录变量、指针指向和数组内容；做程序设计题时，先写清输入、输出、数据结构和函数职责，再补充循环与边界条件。

## 十六、专项精讲：读懂 C 程序如何运行

### 1. 定义、声明、初始化与赋值

这四个概念经常混在一起：

```c
extern int total;   // 声明：说明 total 在别处存在
int count;          // 定义：为 count 分配存储空间
int score = 90;     // 定义并初始化
score = 95;         // 赋值：修改已经存在的对象
```

数组初始化也有自己的规则：

```c
int a[5] = {1, 2};  // 剩余元素自动初始化为 0
int b[] = {1, 2, 3}; // 编译器推断长度为 3
```

局部自动变量如果没有初始化，其值是不确定的，不能把它当作 0 使用。

### 2. 作用域与生存期

| 对象 | 作用域 | 典型生存期 | 默认初值 |
| --- | --- | --- | --- |
| 普通局部变量 | 所在代码块 | 进入代码块到离开代码块 | 不确定 |
| `static` 局部变量 | 所在代码块 | 整个程序运行期间 | 0 |
| 全局变量 | 从声明处到文件末尾 | 整个程序运行期间 | 0 |
| 函数形参 | 函数体 | 一次函数调用期间 | 由实参初始化 |

同名变量发生遮蔽时，内层变量会暂时盖住外层变量。代码阅读题要先确认当前使用的是哪一个对象。

### 3. 表达式求值的三个检查点

拿到表达式时按以下顺序判断：

1. 运算对象分别是什么类型；
2. 运算符的优先级和结合方向是什么；
3. 中间结果是否发生整数除法、溢出或类型转换。

```c
int a = 5, b = 2;
double x = a / b;          // 先做整数除法，结果是 2.0
double y = (double)a / b;  // 结果是 2.5
```

常见优先级从高到低可以简记为：

```text
括号、下标、函数调用
→ 单目运算（!、++、--、*、&、sizeof）
→ 乘除余
→ 加减
→ 关系运算
→ 相等判断
→ &&
→ ||
→ 条件运算 ?: 
→ 赋值
→ 逗号
```

不确定时主动加括号，不要靠记忆赌结合顺序。

### 4. `scanf` 的返回值和常见陷阱

`scanf` 返回成功匹配并赋值的项目数：

```c
int value;
if (scanf("%d", &value) != 1) {
    printf("输入不是合法整数\n");
}
```

常见错误：

- 忘记给普通变量写 `&`；
- 格式符与变量类型不一致；
- 使用 `%s` 读取可能包含空格的文本；
- `%c` 直接读到了上一次输入残留的换行；
- 没有限制字符串最大宽度，导致数组越界；
- 在失败输入仍留在缓冲区时不断重试，形成死循环。

### 5. `fgets` 读取一整行

```c
char line[100];

if (fgets(line, sizeof line, stdin) != NULL) {
    line[strcspn(line, "\n")] = '\0';
}
```

`fgets` 会保留读到的换行，因此常使用 `strcspn` 找到换行位置并替换为 `\0`。

## 十七、数组算法完整模板

### 1. 最大值、最小值、总和与平均值

```c
int max = a[0];
int min = a[0];
int sum = 0;

for (int i = 0; i < n; i++) {
    if (a[i] > max) max = a[i];
    if (a[i] < min) min = a[i];
    sum += a[i];
}

double average = (double)sum / n;
```

关键点：

- 使用 `a[0]` 初始化极值前，要保证 `n > 0`；
- 平均值计算需要避免整数除法；
- 数值范围较大时，`sum` 可以使用 `long long`。

### 2. 冒泡排序

每一轮把当前未排序区间中的最大值“冒泡”到右端：

```c
for (int i = 0; i < n - 1; i++) {
    int swapped = 0;

    for (int j = 0; j < n - 1 - i; j++) {
        if (a[j] > a[j + 1]) {
            int temp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = temp;
            swapped = 1;
        }
    }

    if (!swapped) break;
}
```

外层最多进行 `n - 1` 轮，内层上界需要减去已经排好的元素个数 `i`。

### 3. 选择排序

每一轮从未排序区间找出最小元素，与区间首元素交换：

```c
for (int i = 0; i < n - 1; i++) {
    int min_index = i;

    for (int j = i + 1; j < n; j++) {
        if (a[j] < a[min_index]) {
            min_index = j;
        }
    }

    if (min_index != i) {
        int temp = a[i];
        a[i] = a[min_index];
        a[min_index] = temp;
    }
}
```

冒泡排序比较相邻元素，选择排序寻找一轮中的极值下标。两者都属于平方级时间复杂度。

### 4. 线性查找

```c
int linearSearch(const int a[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (a[i] == target) return i;
    }
    return -1;
}
```

它不要求数组有序，最坏需要检查全部 `n` 个元素。

### 5. 二分查找

```c
int binarySearch(const int a[], int n, int target) {
    int left = 0;
    int right = n - 1;

    while (left <= right) {
        int middle = left + (right - left) / 2;

        if (a[middle] == target) return middle;
        if (a[middle] < target) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }
    return -1;
}
```

二分查找的前提是数组已经有序。循环条件写成 `left <= right`，因为 `left == right` 时仍有一个元素没有检查。

### 6. 数组逆序

```c
for (int left = 0, right = n - 1; left < right; left++, right--) {
    int temp = a[left];
    a[left] = a[right];
    a[right] = temp;
}
```

两个下标从两端向中间移动，只需要交换一半元素。

### 7. 二维数组遍历

```c
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        printf("%d%c", matrix[i][j], j == cols - 1 ? '\n' : ' ');
    }
}
```

阅读双重循环时，先判断外层控制行还是列，再判断内层每一轮访问了哪些元素。

## 十八、字符串专项

### 1. 手写字符串长度

```c
size_t my_strlen(const char *s) {
    size_t length = 0;
    while (s[length] != '\0') {
        length++;
    }
    return length;
}
```

`strlen` 统计的是 `\0` 之前的字符数，不包含结尾空字符。

### 2. 手写字符串复制

```c
void my_strcpy(char *destination, const char *source) {
    while ((*destination++ = *source++) != '\0') {
        /* 赋值表达式同时复制字符并判断是否结束 */
    }
}
```

调用者必须保证目标数组容量足够。

### 3. 手写字符串拼接

```c
void my_strcat(char *destination, const char *source) {
    while (*destination != '\0') {
        destination++;
    }

    while ((*destination++ = *source++) != '\0') {
    }
}
```

先找到目标串的结尾，再从该位置复制源串，最后仍要复制 `\0`。

### 4. 手写子串查找

```c
const char *my_strstr(const char *text, const char *pattern) {
    if (*pattern == '\0') return text;

    for (; *text != '\0'; text++) {
        const char *p = text;
        const char *q = pattern;

        while (*p != '\0' && *q != '\0' && *p == *q) {
            p++;
            q++;
        }

        if (*q == '\0') return text;
    }
    return NULL;
}
```

### 5. 字符数组与字符指针

```c
char a[] = "hello";       // 数组内容可修改
const char *b = "hello";  // 指向字符串字面量，不应修改

a[0] = 'H';   // 可以
// b[0] = 'H'; // 错误行为
```

`sizeof a` 得到整个数组占用的字节数，而 `sizeof b` 得到指针本身的大小。

## 十九、函数与指针专项

### 1. 为什么普通交换函数无效

```c
void wrongSwap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
}
```

`a`、`b` 是实参的副本，交换只发生在函数内部。需要传入地址：

```c
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int x = 3, y = 5;
swap(&x, &y);
```

### 2. 通过指针返回多个结果

```c
int findMinMax(const int a[], int n, int *minimum, int *maximum) {
    if (n <= 0 || minimum == NULL || maximum == NULL) return 0;

    *minimum = a[0];
    *maximum = a[0];

    for (int i = 1; i < n; i++) {
        if (a[i] < *minimum) *minimum = a[i];
        if (a[i] > *maximum) *maximum = a[i];
    }
    return 1;
}
```

这里修改的是 `minimum`、`maximum` 指向的数据，不是让两个局部指针改为指向别处。

### 3. 数组形参中的 `sizeof`

```c
void inspect(int a[]) {
    printf("%zu\n", sizeof a);
}
```

函数参数中的 `int a[]` 会调整为 `int *a`，因此 `sizeof a` 得到的是指针大小，不是原数组大小。数组长度通常需要单独传入。

### 4. 结构体指针

```c
void discount(Book *book, double rate) {
    if (book != NULL) {
        book->price *= rate;
    }
}
```

`book->price` 等价于 `(*book).price`，但前者更清晰。

### 5. 递归题的分析方法

递归函数必须包含：

1. 终止条件；
2. 将问题缩小的递归调用；
3. 对递归结果的组合。

```c
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

阅读递归代码时，先沿调用方向展开，再从最深层开始回代。

## 二十、样题逐步推导

### 1. 最大值和最小值指针跟踪

原样题循环结束前的指向关系如下：

| 阶段 | 当前元素 | `*pMax` | `*pMin` |
| --- | ---: | ---: | ---: |
| 初始化 | `a[0] = 1` | 1 | 1 |
| `i = 1` | 2 | 2 | 1 |
| `i = 2` | 3 | 3 | 1 |
| `i = 3` | 0 | 3 | 0 |
| `i = 4` | 5 | 5 | 0 |
| `i = 5` | 8 | 8 | 0 |

随后发生两件事：

1. 第一条 `printf` 的标签和参数含义相反，所以打印 `min = 8, max = 0`；
2. 交换局部指针后，`pMax` 指向 0、`pMin` 指向 8，所以第二行打印 `min = 0, max = 8`。

整个函数都没有执行 `*调用者指针 = 某个值`，因此主函数里的两个整数保持原值。

### 2. 八进制转换逐步推导

对字符串 `556`：

| 已读字符 | 计算 | 当前结果 |
| --- | --- | ---: |
| `5` | `5` | 5 |
| `5` | `5 × 8 + 5` | 45 |
| `6` | `45 × 8 + 6` | 366 |

更完整的安全版本：

```c
int octalToDecimal(const char *text, int *result) {
    int value = 0;

    if (text == NULL || *text == '\0' || result == NULL) return 0;

    while (*text != '\0') {
        if (*text < '0' || *text > '7') return 0;
        value = value * 8 + (*text - '0');
        text++;
    }

    *result = value;
    return 1;
}
```

### 3. 矩阵乘法完整示例

```c
#include <stdio.h>

#define N 2
#define M 3
#define K 4

void printMatrix(int rows, int cols, const int a[rows][cols]) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            printf("%d%c", a[i][j], j == cols - 1 ? '\n' : ' ');
        }
    }
}

int main(void) {
    int a[N][M] = {{1, 2, 3}, {4, 5, 6}};
    int b[M][K] = {
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };
    int c[N][K] = {0};

    for (int i = 0; i < N; i++) {
        for (int j = 0; j < K; j++) {
            for (int k = 0; k < M; k++) {
                c[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    printMatrix(N, K, c);
    return 0;
}
```

输出：

```text
38 44 50 56
83 98 113 128
```

## 二十一、书籍管理综合题完整参考实现

下面的实现把数据定义、输入、查找、评分、平均分和 Top 3 排序串成一个完整程序。它不照抄提纲末尾存在参数遗漏和变量名混用的参考主函数。

```c
#include <stdio.h>
#include <string.h>

#define MAX_BOOKS 5
#define MAX_NAME_LEN 50
#define READERS 3

typedef struct {
    char name[MAX_NAME_LEN];
    double price;
    int scores[READERS];
    double avg_score;
} Book;

void clearLine(void) {
    int ch;
    while ((ch = getchar()) != '\n' && ch != EOF) {
    }
}

int readLine(char text[], int size) {
    if (fgets(text, size, stdin) == NULL) return 0;

    size_t length = strlen(text);
    if (length > 0 && text[length - 1] == '\n') {
        text[length - 1] = '\0';
    } else {
        clearLine();
    }
    return 1;
}

int inputBooks(Book books[], int n) {
    for (int i = 0; i < n; i++) {
        printf("第 %d 本（书名, 价格）：", i + 1);

        if (scanf(" %49[^,], %lf", books[i].name, &books[i].price) != 2) {
            clearLine();
            return i;
        }

        clearLine();
        books[i].avg_score = 0.0;
        for (int j = 0; j < READERS; j++) {
            books[i].scores[j] = 0;
        }
    }
    return n;
}

int findBook(const Book books[], int n, const char name[]) {
    for (int i = 0; i < n; i++) {
        if (strcmp(books[i].name, name) == 0) {
            return i;
        }
    }
    return -1;
}

int inputScore(Book *book) {
    if (book == NULL) return 0;

    printf("请输入 3 个 0 到 5 的整数评分：");
    for (int i = 0; i < READERS; i++) {
        if (scanf("%d", &book->scores[i]) != 1 ||
            book->scores[i] < 0 || book->scores[i] > 5) {
            clearLine();
            return 0;
        }
    }
    clearLine();
    return 1;
}

void calculateAvgScore(Book *book) {
    int sum = 0;
    if (book == NULL) return;

    for (int i = 0; i < READERS; i++) {
        sum += book->scores[i];
    }
    book->avg_score = (double)sum / READERS;
}

void printTop3(const Book books[], int n, Book top3[]) {
    Book sorted[MAX_BOOKS];

    for (int i = 0; i < n; i++) {
        sorted[i] = books[i];
    }

    for (int i = 0; i < n - 1; i++) {
        int max_index = i;

        for (int j = i + 1; j < n; j++) {
            if (sorted[j].avg_score > sorted[max_index].avg_score) {
                max_index = j;
            }
        }

        if (max_index != i) {
            Book temp = sorted[i];
            sorted[i] = sorted[max_index];
            sorted[max_index] = temp;
        }
    }

    int count = n < 3 ? n : 3;
    for (int i = 0; i < count; i++) {
        top3[i] = sorted[i];
        printf("第 %d 名：《%s》 %.2f 元，%.2f 分\n",
               i + 1,
               top3[i].name,
               top3[i].price,
               top3[i].avg_score);
    }
}

int main(void) {
    Book books[MAX_BOOKS];
    Book top3[3];
    int rated[MAX_BOOKS] = {0};
    int rated_count = 0;

    int number = inputBooks(books, MAX_BOOKS);
    if (number == 0) {
        printf("没有读入有效书籍。\n");
        return 1;
    }

    while (rated_count < number) {
        char search_name[MAX_NAME_LEN];
        printf("输入要评分的书名：");

        if (!readLine(search_name, sizeof search_name)) break;

        int index = findBook(books, number, search_name);
        if (index == -1) {
            printf("Not Found!\n");
            continue;
        }
        if (rated[index]) {
            printf("这本书已经完成评分。\n");
            continue;
        }
        if (!inputScore(&books[index])) {
            printf("评分输入无效，请重新输入。\n");
            continue;
        }

        calculateAvgScore(&books[index]);
        rated[index] = 1;
        rated_count++;
    }

    printTop3(books, number, top3);
    return 0;
}
```

### 综合题评分点

如果考试只要求“数据类型设计与函数声明”，不需要默写完整实现。答题时优先拿稳这些分：

1. 结构体成员类型正确；
2. 结构体数组和 `top3` 定义正确；
3. 五个函数的返回类型、参数类型与职责一致；
4. 需要修改一本书时传 `Book *`；
5. 查找函数能够返回下标或 `-1`；
6. 平均分使用浮点除法；
7. 注释写清每个函数的输入、输出和副作用。

## 二十二、常见失分点

| 失分点 | 错误表现 | 检查方法 |
| --- | --- | --- |
| 数组越界 | 循环写成 `i <= n` | 最后一次下标必须是 `n - 1` |
| 整数除法 | `double avg = sum / n` | 至少一个运算数转为 `double` |
| 赋值与比较混淆 | `if (x = 0)` | 判断相等使用 `==` |
| 忘记初始化 | 极值、累加器直接使用 | 循环前检查初始值 |
| 指针层次混乱 | 把 `p = value` 当作写入对象 | 修改对象通常写 `*p = value` |
| 字符串没有结尾 | 手写复制时漏掉 `\0` | 确认终止字符也被复制 |
| `scanf` 类型不匹配 | `double` 使用 `%f` 输入 | `double` 输入使用 `%lf` |
| `switch` 贯穿 | 分支末尾漏写 `break` | 明确是否需要继续执行下一分支 |
| 二分边界错误 | 漏查最后一个元素 | 使用 `left <= right` 并正确更新边界 |
| 函数声明不一致 | 调用参数数目和原型不同 | 最后对照声明、定义、调用三处 |
| 结构体访问符错误 | 指针使用 `.` | 对象用 `.`, 指针用 `->` |
| 输入残留换行 | `%c` 或 `fgets` 读到空行 | 检查前一次输入是否留下换行 |

## 二十三、考前自测题

### 1. 基础判断

1. `int a[10]` 的合法下标范围是什么？
2. `strlen("abc")` 与 `sizeof("abc")` 分别是多少？
3. `5 / 2` 与 `5 / 2.0` 的结果分别是什么？
4. `break` 和 `continue` 的区别是什么？
5. 为什么函数中的 `sizeof(a)` 不能得到数组形参的原长度？
6. `Book book` 和 `Book *book` 访问成员分别使用什么运算符？

答案：

1. `0` 到 `9`；
2. `3` 和 `4`；
3. `2` 和 `2.5`；
4. `break` 结束当前循环，`continue` 只跳过本轮剩余语句；
5. 数组形参会调整为指针；
6. 分别使用 `.` 和 `->`。

### 2. 代码阅读

```c
int a[] = {2, 4, 6};
int *p = a;

printf("%d\n", *p++);
printf("%d\n", (*p)++);
printf("%d\n", a[1]);
```

输出为：

```text
2
4
5
```

解释：`*p++` 等价于 `*(p++)`，先读取 2 再让指针后移；`(*p)++` 先读取 4，再把 `a[1]` 改为 5。

### 3. 编程练习

完成下面这些题，基本可以覆盖提纲的主要算法：

1. 一次遍历同时求数组最大值、最小值及其下标；
2. 使用选择排序将整数数组从大到小排列；
3. 在有序数组中实现二分查找；
4. 不调用 `strlen`、`strcpy`、`strcmp`，分别实现对应功能；
5. 判断一个字符串是否为回文串；
6. 求二维数组主对角线与副对角线之和；
7. 完成两个矩阵的乘法；
8. 使用结构体保存学生姓名和成绩，并输出平均分最高的学生；
9. 使用指针参数让函数同时返回最大值和最小值；
10. 将八进制数字字符串转换为十进制，并拒绝包含 `8`、`9` 的非法输入。

## 二十四、最后一遍复习清单

### 能口头解释

- [ ] 数组名在表达式和函数参数中如何转换；
- [ ] 值传递与“传入地址后修改对象”的区别；
- [ ] 字符数组、字符串和字符指针的区别；
- [ ] `if-else` 配对、`switch` 贯穿和逻辑短路；
- [ ] 冒泡排序、选择排序、线性查找、二分查找的基本过程；
- [ ] 结构体对象与结构体指针的成员访问方式。

### 能独立写出

- [ ] 一维数组遍历、统计和逆序；
- [ ] 二维数组双重循环与矩阵乘法；
- [ ] 字符串长度、复制、比较和子串查找；
- [ ] 函数声明、定义与调用；
- [ ] 指针交换和多结果返回；
- [ ] 结构体数组的输入、查找、排序和输出。

### 能主动检查

- [ ] 循环边界是否越界；
- [ ] 变量是否初始化；
- [ ] 输入格式符是否匹配；
- [ ] 除法是否需要转换为浮点数；
- [ ] 字符串是否有空间存放 `\0`；
- [ ] 函数声明、定义和调用是否完全一致；
- [ ] 指针是否有效，解引用层次是否正确；
- [ ] 题目要求返回值还是修改实参。
