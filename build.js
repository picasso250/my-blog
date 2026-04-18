const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');
const footnote = require('marked-footnote');

marked.use(footnote());

const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_FILE = path.join(__dirname, 'templates', 'post.html');
const SITE_URL = 'https://blog.io99.xyz';
const SITE_NAME = '我的博客';
const SITE_DESCRIPTION = '记录成长，分享知识。这里写技术、阅读与思考。';

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function cleanDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getReadingTime(content) {
    const wordsPerMinute = 200;
    const chineseCharsPerMinute = 400;
    
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    
    const minutes = (chineseChars / chineseCharsPerMinute) + (englishWords / wordsPerMinute);
    return Math.max(1, Math.ceil(minutes));
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');
}

function stripMarkdown(content) {
    return content
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\[\^.+?\]:.*$/gm, ' ')
        .replace(/^#+\s+/gm, '')
        .replace(/[*_>#-]/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getMetaDescription(content) {
    return stripMarkdown(content).substring(0, 160).trim();
}

function generatePostHtml(template, post) {
    return template
        .replace(/\{\{title\}\}/g, escapeHtml(post.title))
        .replace(/\{\{category\}\}/g, escapeHtml(post.category))
        .replace(/\{\{date\}\}/g, escapeHtml(post.date))
        .replace(/\{\{description\}\}/g, escapeHtml(post.metaDescription))
        .replace(/\{\{canonicalUrl\}\}/g, escapeHtml(post.canonicalUrl))
        .replace(/\{\{siteName\}\}/g, escapeHtml(SITE_NAME))
        .replace(/\{\{content\}\}/g, post.htmlContent);
}

function generateIndexPostCard(post) {
    return `                <article class="post-card">
                    <div class="post-image">
                        <div class="placeholder-image">${post.emoji || '📝'}</div>
                    </div>
                    <div class="post-content">
                        <span class="post-category">${post.category}</span>
                        <h3><a href="${post.url}">${post.title}</a></h3>
                        <p class="post-excerpt">${post.excerpt}</p>
                        <div class="post-meta">
                            <span class="date">${post.date}</span>
                            <span class="read-time">${post.readingTime} 分钟阅读</span>
                        </div>
                    </div>
                </article>`;
}

function build() {
    console.log('开始构建博客...\n');

    cleanDir(DIST_DIR);
    ensureDir(DIST_DIR);
    ensureDir(path.join(DIST_DIR, 'posts'));
    
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
    
    const postFiles = fs.readdirSync(POSTS_DIR)
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => b.localeCompare(a));
    
    const posts = [];
    
    postFiles.forEach(file => {
        const filePath = path.join(POSTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        
        const htmlContent = marked.parse(content);
        const readingTime = getReadingTime(content);
        const date = formatDate(data.date);
        const slug = file.replace('.md', '');
        const url = `posts/${slug}.html`;
        const canonicalUrl = `${SITE_URL}/${url}`;
        const metaDescription = getMetaDescription(content);
        
        const excerpt = content
            .replace(/^#.*$/gm, '')
            .replace(/\n/g, ' ')
            .substring(0, 100)
            .trim() + '...';
        
        const post = {
            title: data.title,
            date: date,
            category: data.category,
            emoji: data.emoji || '📝',
            url: url,
            excerpt: excerpt,
            readingTime: readingTime,
            htmlContent: htmlContent,
            metaDescription: metaDescription,
            canonicalUrl: canonicalUrl,
            sortDate: new Date(data.date)
        };
        
        posts.push(post);
        
        const postHtml = generatePostHtml(template, post);
        const outputPath = path.join(DIST_DIR, 'posts', `${slug}.html`);
        fs.writeFileSync(outputPath, postHtml);
        
        console.log(`✓ 生成文章: ${post.title}`);
    });
    
    posts.sort((a, b) => b.sortDate - a.sortDate);
    
    const indexTemplate = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
    
    const postCardsHtml = posts.map(post => generateIndexPostCard(post)).join('\n');
    
    let newIndexHtml = indexTemplate.replace(
        /<div class="posts-grid" id="posts-container">[\s\S]*?<\/div>\s*<\/section>/,
        `<div class="posts-grid" id="posts-container">\n${postCardsHtml}\n            </div>\n        </section>`
    );
    
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), newIndexHtml);
    console.log('\n✓ 生成首页');

    const sitemapUrls = [
        { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
        { loc: `${SITE_URL}/about.html`, changefreq: 'monthly', priority: '0.6' },
        { loc: `${SITE_URL}/contact.html`, changefreq: 'monthly', priority: '0.4' },
        ...posts.map(post => ({
            loc: post.canonicalUrl,
            changefreq: 'monthly',
            priority: '0.8'
        }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(url => `  <url>\n    <loc>${escapeHtml(url.loc)}</loc>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
    console.log('✓ 生成: sitemap.xml');

    const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
    fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots);
    console.log('✓ 生成: robots.txt');
    
    const staticFiles = ['style.css', 'script.js', 'about.html', 'contact.html'];
    staticFiles.forEach(file => {
        const src = path.join(__dirname, file);
        const dest = path.join(DIST_DIR, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✓ 复制: ${file}`);
        }
    });
    
    console.log(`\n构建完成！共 ${posts.length} 篇文章`);
    console.log(`输出目录: ${DIST_DIR}`);
    console.log('\n运行 npm run dev 启动本地服务器预览');
}

build();
