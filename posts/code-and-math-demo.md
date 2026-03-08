---
title: 代码与公式演示
date: 2026-03-08
category: 技术
emoji: 🔢
---

这篇文章演示博客系统对代码和数学公式的支持。

## 代码示例

### Python 基础

```python
def fibonacci(n):
    """计算斐波那契数列的第 n 项"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 打印前 10 项
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

### JavaScript 示例

```javascript
const quickSort = (arr) => {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[0];
    const left = arr.slice(1).filter(x => x < pivot);
    const right = arr.slice(1).filter(x => x >= pivot);
    
    return [...quickSort(left), pivot, ...quickSort(right)];
};

console.log(quickSort([3, 1, 4, 1, 5, 9, 2, 6]));
```

## 数学公式

### 欧拉公式

欧拉公式是数学中最优美的公式之一：

$$e^{i\pi} + 1 = 0$$

### 二次方程求根公式

对于一元二次方程 $ax^2 + bx + c = 0$，其解为：

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

### 勾股定理

在直角三角形中，斜边的平方等于两直角边的平方和：

$$a^2 + b^2 = c^2$$

### 积分公式

高斯积分：

$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

## 总结

现代博客系统应该支持：
- **代码高亮**：方便技术文章的编写
- **数学公式**：支持学术和技术内容

这样可以让博客更加专业和实用！
