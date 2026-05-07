---
title: Go vs Node.js TUI 内存实测（RSS 数据）
date: 2026-05-07
category: 技术
emoji: 📊
---

同一个 Hello World TUI（全屏显示一行字 + 按 q 退出）：

- **Go + Bubble Tea** → **6.52 MB RSS**
- **Node + blessed** → **56.40 MB RSS**

## 测试方案

### 对比组

| 方案 | 语言 | TUI 库 |
| :-- | :-- | :-- |
| Go TUI | Go 1.25.6 | [Bubble Tea](https://github.com/charmbracelet/bubbletea) v1.3.10 |
| Node TUI | Node.js v25.6.1 | [blessed](https://github.com/chjj/blessed) v0.1.81 |

### 程序

两个程序的行为完全一样：

```
全屏显示：
  Hello TUI
  Press q to quit

按 q 退出
```

Go 版（Bubble Tea 的 Elm Architecture 模式）：

```go
package main

import (
    "fmt"
    "os"

    tea "github.com/charmbracelet/bubbletea"
)

type model struct{}

func (m model) Init() tea.Cmd           { return nil }
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.KeyMsg:
        switch msg.String() {
        case "q", "ctrl+c":
            return m, tea.Quit
        }
    }
    return m, nil
}
func (m model) View() string {
    return "\n  Hello TUI\n  Press q to quit\n"
}

func main() {
    p := tea.NewProgram(model{}, tea.WithAltScreen())
    p.Run()
}
```

Node 版（blessed 的 Screen/Box 模式）：

```js
const blessed = require('blessed');

const screen = blessed.screen({ smartCSR: true, title: 'hello-tui' });

const box = blessed.box({
    top: 'center', left: 'center',
    width: '50%', height: '50%',
    content: 'Hello TUI\nPress q to quit',
    border: { type: 'line' },
    style: { fg: 'white', bg: 'black', border: { fg: '#f0f0f0' } }
});

screen.append(box);
screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
screen.render();

// keep alive for measurement
setInterval(() => {}, 1000);
```

### 测量方法

测量环境：Windows 11，PowerShell 终端，两次采样间隔 1–2 秒取稳定值。

关键代码：

```powershell
$proc = Start-Process -FilePath "<exe>" -NoNewWindow -PassThru
Start-Sleep -Seconds 2
$p = Get-Process -Id $proc.Id
$rssMB = [math]::Round($p.WorkingSet64 / 1MB, 2)
$privMB = [math]::Round($p.PrivateMemorySize64 / 1MB, 2)
$proc.Kill()
```

为什么看 **RSS（WorkingSet64）**？因为它反映进程实际占用的物理内存，是系统压力的直接指标。同时也记录 **Private Memory**（不含共享 DLL 的独占内存）。Node 官方文档也建议关注 RSS，而非只看 heap。([Node.js Learn][1])

> 注意：不能用 `Start-Process -WindowStyle Minimized` 启动 TUI 程序——Minimized 无实际终端窗口时，Go 进程的 RSS 会被虚报到 108 MB。必须用 `-NoNewWindow` 让它在当前终端渲染，才能拿到真实内存。[^1]

### 额外基线

为了区分「运行时开销」和「TUI 库开销」，还跑了两个无 TUI 的基线程序——纯 `println/console.log` + `sleep(5s)`，什么都不渲染。

## 结果

### 一、纯运行时基线

| 方案 | 代码 | RSS | Private Memory |
| :-- | :-- | :-: | :-: |
| **Go bare** | `println("Hello World"); sleep(5)` | **5.13 MB** | 11.61 MB |
| **Node bare** | `console.log("Hello World"); setTimeout(_,5s)` | **48.21 MB** | 19.55 MB |

纯启动状态，Node（V8 + libuv + 模块加载）占 **48 MB RSS**，Go 占 **5 MB RSS**。

### 二、Hello World TUI

| 方案 | TUI 库 | RSS | Private Memory |
| :-- | :-- | :-: | :-: |
| **Go + Bubble Tea** | bubbletea v1.3.10 | **6.52 MB** | 13.06 MB |
| **Node + blessed** | blessed v0.1.81 | **56.40 MB** | 60.58 MB |

### 三、TUI 库的额外开销（TUI RSS − 纯启动 RSS）

| 维度 | Go (bubbletea) | Node (blessed) |
| :-- | :-: | :-: |
| RSS 增量 | +1.39 MB | +8.19 MB |
| Private Memory 增量 | +1.45 MB | +41.03 MB |

Node 的 blessed 模块被 V8 解析/编译后，private memory 多了约 **41 MB**。Go 的 bubbletea 编译进 3 MB 二进制后，运行时额外只占不到 **1.5 MB**。

### 四、多次运行验证

各跑 3 轮，偏差在 1% 以内：

```
Go #1:  RSS=6.55 MB  Priv=13.11 MB
Go #2:  RSS=6.50 MB  Priv=13.04 MB
Go #3:  RSS=6.52 MB  Priv=13.06 MB

Node #1: RSS=56.38 MB  Priv=60.56 MB
Node #2: RSS=56.45 MB  Priv=60.58 MB
Node #3: RSS=56.40 MB  Priv=60.58 MB
```

## 分析

Hello World TUI 的业务逻辑几乎为零——内存主要不是你的代码吃的。

**Node.js 运行时开销：**

```
V8 引擎（即时编译器、GC、内联缓存）
Node runtime 层（libuv、tty 封装）
模块系统（解析、缓存）
blessed 及其依赖（~41 MB private memory）
```

**Go 运行时开销：**

```
Go runtime（goroutine 调度器、GC 元数据）
单二进制（3 MB，编译时已包含所有依赖）
```

这是典型的**运行时税（runtime tax）**。Node 的好处是生态、动态开发快、npm 包多；但在小工具、小面板、命令行 TUI 这种场景，基础内存确实偏重。

## 选型参考

**倾向于 Go TUI：**

- 低配 VPS 上的管理面板
- 需要秒开、常驻的 CLI 工具
- 单文件分发（一条二进制带走）
- 容器/边缘环境，内存敏感

**倾向于 Node TUI：**

- 原型快，团队更熟 JS/TS
- 需要复用 npm 生态
- TUI 只是开发工具，不常驻内存
- 可接受 ~50 MB 的运行时开销

---

[^1]: 测量工具本身也会影响测量结果。Windows 上用 `Start-Process -WindowStyle Minimized` 启动 Go TUI 程序（没有真正的终端窗口），RSS 被虚报到 108 MB。原因是 Bubble Tea 检测到没有 TTY 时退回了非交互模式，但没有正常释放初始化分配的内存。TUI 程序的内存测量，必须在真实终端中进行。

[1]: https://nodejs.org/learn/diagnostics/memory/understanding-and-tuning-memory "Node.js Learn: Understanding and Tuning Memory"
