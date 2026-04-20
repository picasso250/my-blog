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

## Notes
- 文章文件名用 kebab-case。
- `date` 用 `YYYY-MM-DD`。
- `wrangler whoami` 超时，不等于无权。
- 每次修改完毕后，确保 `live-server` 正在服务 `dist/`，便于立即验看。
