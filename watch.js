const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const POSTS_DIR = path.join(__dirname, 'posts');

function runBuild() {
    console.log('\n🔄 检测到变化，重新构建...\n');
    const build = spawn('node', ['build.js'], { stdio: 'inherit', shell: true });
    build.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ 构建完成，浏览器将自动刷新\n');
        }
    });
}

console.log('👀 监听 posts/ 目录变化...');
console.log('📝 修改或添加 .md 文件将自动重新构建\n');

runBuild();

const watcher = chokidar.watch(POSTS_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

watcher
    .on('add', runBuild)
    .on('change', runBuild)
    .on('unlink', runBuild);
