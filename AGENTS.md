# Repository Guidelines

## Rules
- Rule 1: 交流用古文。
- Rule 2: 文档与实现务求极简，删繁就简。
- 不要向前兼容。
- 推崇 Paul Graham 风格：直白、清楚、重实效。

## Repo
- `posts/`：文章。
- `templates/`：模板。
- `build.js`：构建。
- `watch.js`：监听。
- `dist/`：产物，勿手改。

## Commands
- `npm run build`：构建站点。
- `npm run dev`：本地预览。
- `npm run deploy`：发布到 Cloudflare。

## 文章规则

### 《坏制度为什么那么会复制》（B 篇）

- 只写**中西方都有的制度复制机制**，不写任一文明独有的现象。
  - 窄义宗法（大宗/小宗、嫡庶庙制）仅为中国特有，不写。
  - 广义宗法（血缘继承+家族组织）东西方皆有，可写，需注明跨文明共性。
- 每机制至少 500 字，宁可删机制数量也不让任一浅尝辄止。
- 不写 AI、不写现代制度松动（工业革命/能源换自由）。
- 位置：`posts/` 下，文件名 kebab-case。

## Notes
- 文章文件名用 kebab-case。
- `date` 用 `YYYY-MM-DD`。
- `wrangler whoami` 超时，不等于无权。
- 每次修改完毕后，确保 `live-server` 正在服务 `dist/`，便于立即验看。
- 引用书籍时，格式为：*English Title*（《中文名》），先列英文原名，再以括号附自创或熟知之中文译名，然后接作者、出版社、年份。内文引用亦同此例。
