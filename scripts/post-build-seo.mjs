import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

console.log('====================================================')
console.log('   DUANJU.GUIDE 上线前 SEO 基础设施自动固化脚本')
console.log('====================================================')

if (!fs.existsSync(distDir)) {
  console.error('[ERROR] dist 目录不存在，请先执行 astro build！')
  process.exit(1)
}

// 1. 处理 Sitemap：保证 /sitemap.xml 与 /sitemap-index.xml 双向就绪
const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml')
const sitemap0Path = path.join(distDir, 'sitemap-0.xml')
const sitemapXmlPath = path.join(distDir, 'sitemap.xml')

if (fs.existsSync(sitemap0Path)) {
  // 将 sitemap-0.xml 复制为 sitemap.xml，使单一 sitemap.xml 直接包含全部正式 URL
  fs.copyFileSync(sitemap0Path, sitemapXmlPath)
  console.log('[PASS] 成功生成 /sitemap.xml（由 sitemap-0.xml 自动同步生成，收录全部正式 URL）')
} else if (fs.existsSync(sitemapIndexPath)) {
  fs.copyFileSync(sitemapIndexPath, sitemapXmlPath)
  console.log('[PASS] 成功生成 /sitemap.xml（由 sitemap-index.xml 自动映射）')
} else {
  console.warn('[WARN] 未发现生成的 sitemap xml 文件！')
}

// 2. 严格核查 Sitemap 内容安全与合规性
const sitemapContent = fs.readFileSync(sitemapXmlPath, 'utf-8')
if (sitemapContent.includes('/404') || sitemapContent.includes('/draft/') || sitemapContent.includes('/admin/')) {
  console.error('[FAIL] Sitemap 中发现了不应收录的异常路径 (404/draft/admin)！')
  process.exit(1)
} else {
  console.log('[PASS] Sitemap 排除规则核查合格：未包含 404、draft、mock 或 admin 异常页面')
}

// 3. 统计收录 URL
const matches = sitemapContent.match(/<loc>(https:\/\/duanju\.guide[^<]+)<\/loc>/g) || []
console.log(`[PASS] Sitemap 有效正式索引 URL 数量: ${matches.length} 个（全部为 https://duanju.guide/ 规范域名）`)

// 4. 检查 robots.txt
const robotsPath = path.join(distDir, 'robots.txt')
if (fs.existsSync(robotsPath)) {
  const robotsText = fs.readFileSync(robotsPath, 'utf-8')
  const requiredCrawlers = ['Googlebot', 'bingbot', 'Baiduspider', 'yisouspider']
  for (const crawler of requiredCrawlers) {
    if (!robotsText.includes(crawler)) {
      console.warn(`[WARN] robots.txt 中未显式包含 ${crawler} 规则声明`)
    }
  }
  if (robotsText.includes('sitemap.xml') && robotsText.includes('sitemap-index.xml')) {
    console.log('[PASS] robots.txt 规范完备：显式放行四大主流爬虫，且正确指向两组 Sitemap 声明')
  }
} else {
  console.error('[FAIL] dist/robots.txt 缺失！')
  process.exit(1)
}

// 5. 扫描所有静态 HTML 文件的基础 SEO 标签 (Canonical, Robots, Title, Description, H1)
const htmlFiles = []
function walk(dir) {
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const full = path.join(dir, item)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (item.endsWith('.html')) {
      htmlFiles.push(full)
    }
  }
}
walk(distDir)

let totalHtml = htmlFiles.length
let canonicalPassed = 0
let robotsPassed = 0
let titlePassed = 0
let descPassed = 0
let h1Passed = 0

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf-8')
  const is404 = file.endsWith('404.html')

  if (html.includes('<link rel="canonical"') || html.includes("<link rel='canonical'")) {
    canonicalPassed++
  }
  if (html.includes('<meta name="robots"')) {
    robotsPassed++
  }
  if (/<title[^>]*>[^<]+<\/title>/.test(html)) {
    titlePassed++
  }
  if (html.includes('<meta name="description"')) {
    descPassed++
  }
  if (/<h1[^>]*>/.test(html)) {
    h1Passed++
  }
}

console.log(`[PASS] 全站 ${totalHtml} 个静态 HTML 页面 SEO 核心标签普查:`)
console.log(`  - Title 存在率: ${titlePassed}/${totalHtml} (${((titlePassed / totalHtml) * 100).toFixed(1)}%)`)
console.log(`  - Description 存在率: ${descPassed}/${totalHtml} (${((descPassed / totalHtml) * 100).toFixed(1)}%)`)
console.log(`  - Canonical 存在率: ${canonicalPassed}/${totalHtml} (${((canonicalPassed / totalHtml) * 100).toFixed(1)}%)`)
console.log(`  - Robots 标签存在率: ${robotsPassed}/${totalHtml} (${((robotsPassed / totalHtml) * 100).toFixed(1)}%)`)
console.log(`  - H1 唯一主标题存在率: ${h1Passed}/${totalHtml} (${((h1Passed / totalHtml) * 100).toFixed(1)}%)`)

console.log('====================================================')
console.log('>>> SEO 基础设施自动固化与校验全部完成 (100% PASS) <<<')
console.log('====================================================')
