# 我的博客

一个基于 Markdown 的静态博客系统，写 Markdown 文件即可发布文章。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 写文章

在 `posts/` 目录下创建 Markdown 文件，格式如下：

```markdown
---
title: 文章标题
date: 2026-03-08
category: 技术
emoji: 📝
---

文章内容...
```

Frontmatter 字段说明：
- `title`: 文章标题（必填）
- `date`: 发布日期（必填，格式 YYYY-MM-DD）
- `category`: 分类（必填）
- `emoji`: 封面图标（可选，默认 📝）

### 3. 构建

```bash
npm run build
```

构建后的静态文件在 `dist/` 目录。

### 4. 预览

```bash
npm run dev
```

浏览器会自动打开 http://localhost:8080

开发模式下会自动监听 `posts/` 目录的变化，修改或添加文章后自动重新构建。

## 目录结构

```
my-blog/
├── posts/              # Markdown 文章目录
│   ├── article-1.md
│   └── article-2.md
├── templates/          # 模板目录
│   └── post.html       # 文章页面模板
├── dist/               # 构建输出目录
│   ├── index.html
│   ├── posts/
│   ├── style.css
│   └── ...
├── build.js            # 构建脚本
├── index.html          # 首页模板
├── style.css           # 样式文件
├── script.js           # JavaScript 文件
├── about.html          # 关于页面
├── contact.html        # 联系页面
└── package.json
```

## 发布新文章

1. 在 `posts/` 目录创建新的 `.md` 文件
2. 添加 frontmatter 和内容
3. 运行 `npm run build`
4. 将 `dist/` 目录部署到任意静态托管服务

## 部署

`dist/` 目录可以直接部署到：
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- 或任何静态文件服务器

## 技术栈

- Node.js
- marked (Markdown 解析)
- gray-matter (Frontmatter 解析)

## 许可证

MIT License
