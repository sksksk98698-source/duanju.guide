import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const baselinePath = path.join(__dirname, 'seo-baseline.json')

console.log('====================================================')
console.log('       DUANJU.GUIDE 全站 SEO 索引发布安全门禁       ')
console.log('====================================================')

const checklist = {
  build: 'PENDING',
  robots: 'PENDING',
  noindex: 'PENDING',
  canonical: 'PENDING',
  sitemap: 'PENDING',
  internalLinks: 'PENDING',
  coreUrls: 'PENDING',
  schema: 'PENDING',
  duplicateTitles: 'PENDING',
  pageCount: 'PENDING',
  antiSpam: 'PENDING',
  indexNow: 'PENDING',
}

const errors = []
const warnings = []

// ----------------------------------------------------
// 1. Build 基础输出存在性检查
// ----------------------------------------------------
if (!fs.existsSync(distDir)) {
  errors.push({
    item: 'Build',
    file: 'dist/',
    url: 'N/A',
    reason: 'dist 目录不存在，请先运行构建命令 (npm run build)！',
    solution: '在根目录执行 npm run build 编译静态产物。',
  })
  checklist.build = 'FAIL'
} else {
  const essentialFiles = ['index.html', '404.html', 'robots.txt', 'sitemap.xml']
  const missing = essentialFiles.filter((f) => !fs.existsSync(path.join(distDir, f)))
  if (missing.length > 0) {
    errors.push({
      item: 'Build',
      file: missing.join(', '),
      url: 'N/A',
      reason: `关键生产文件缺失: ${missing.join(', ')}`,
      solution: '重新执行 npm run build 生成缺失文件。',
    })
    checklist.build = 'FAIL'
  } else {
    checklist.build = 'PASS'
  }
}

if (checklist.build === 'FAIL') {
  printReport()
  process.exit(1)
}

// 收集全站 HTML 文件
const htmlFiles = []
function walkHtml(dir) {
  const entries = fs.readdirSync(dir)
  for (const entry of entries) {
    const full = path.join(dir, entry)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walkHtml(full)
    } else if (entry.endsWith('.html')) {
      htmlFiles.push(full)
    }
  }
}
walkHtml(distDir)
const totalHtmlPages = htmlFiles.length

// ----------------------------------------------------
// 2. robots.txt 安全检查 (禁止生产全站 Disallow: /)
// ----------------------------------------------------
const robotsPath = path.join(distDir, 'robots.txt')
const robotsContent = fs.readFileSync(robotsPath, 'utf-8')

// 严厉检测全站 Disallow
const isDisallowAll = /(User-agent:\s*\*[\s\S]*?Disallow:\s*\/($|\s))/i.test(robotsContent)
if (isDisallowAll) {
  errors.push({
    item: 'Robots',
    file: 'dist/robots.txt',
    url: '/robots.txt',
    reason: '检测到致命安全配置：User-agent: * Disallow: /，这将导致全站被搜索引擎直接剔除索引！',
    solution: '必须修正 robots.txt 为 Allow: / 并放行正常爬虫。',
  })
  checklist.robots = 'FAIL'
} else if (!robotsContent.includes('Googlebot') || !robotsContent.includes('bingbot')) {
  warnings.push('robots.txt 建议显式声明放行 Googlebot 与 bingbot 爬虫。')
  checklist.robots = 'PASS'
} else if (!robotsContent.includes('sitemap.xml')) {
  errors.push({
    item: 'Robots',
    file: 'dist/robots.txt',
    url: '/robots.txt',
    reason: 'robots.txt 中未包含 sitemap.xml 声明！',
    solution: '在 robots.txt 末尾添加 Sitemap: https://duanju.guide/sitemap.xml',
  })
  checklist.robots = 'FAIL'
} else {
  checklist.robots = 'PASS'
}

// ----------------------------------------------------
// 3. Noindex 异常安全检查 (仅允许 404 页面带 noindex)
// ----------------------------------------------------
let illegalNoindexCount = 0
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const is404 = file.endsWith('404.html')
  const hasNoindex = /<meta[^>]+name=["'](robots|googlebot|bingbot)["'][^>]+content=["'][^"']*noindex[^"']*["']/i.test(content)

  if (hasNoindex && !is404) {
    illegalNoindexCount++
    const rel = path.relative(distDir, file).replace(/\\/g, '/')
    errors.push({
      item: 'Noindex',
      file: rel,
      url: `/${rel.replace(/index\.html$/, '')}`,
      reason: `正式 SEO 页面意外包含了 noindex 标签，会导致搜索引擎剔除该页面索引！`,
      solution: '检查该页面 frontmatter 或 layout 参数，移除 noindex 限制。',
    })
  }
}
if (illegalNoindexCount === 0) {
  checklist.noindex = 'PASS'
} else {
  checklist.noindex = 'FAIL'
}

// ----------------------------------------------------
// 4. Canonical 绝对规范检查 (自引用、HTTPS、无参数、无全站指向首页)
// ----------------------------------------------------
let canonicalErrors = 0
let canonicalToHomeCount = 0

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const is404 = file.endsWith('404.html')
  if (is404) continue // 404 页面忽略 canonical 检查

  const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
  const rel = path.relative(distDir, file).replace(/\\/g, '/')

  if (!canonicalMatch) {
    canonicalErrors++
    errors.push({
      item: 'Canonical',
      file: rel,
      url: `/${rel.replace(/index\.html$/, '')}`,
      reason: '页面缺失 <link rel="canonical"> 规范标签！',
      solution: '在 BaseLayout 中添加自动自引用 canonical 逻辑。',
    })
    continue
  }

  const canonUrl = canonicalMatch[1]
  if (!canonUrl.startsWith('https://duanju.guide/')) {
    canonicalErrors++
    errors.push({
      item: 'Canonical',
      file: rel,
      url: `/${rel.replace(/index\.html$/, '')}`,
      reason: `Canonical 必须使用正式 HTTPS 域名，当前为: ${canonUrl}`,
      solution: '修正 SITE.url 或 BaseLayout canonical 生成逻辑。',
    })
  }

  if (canonUrl.includes('?') || canonUrl.includes('#')) {
    canonicalErrors++
    errors.push({
      item: 'Canonical',
      file: rel,
      url: `/${rel.replace(/index\.html$/, '')}`,
      reason: `Canonical URL 包含跟踪参数或锚点: ${canonUrl}`,
      solution: '强制剥离 URL 查询参数。',
    })
  }

  if (canonUrl === 'https://duanju.guide/' && rel !== 'index.html') {
    canonicalToHomeCount++
  }
}

if (canonicalToHomeCount > 0) {
  errors.push({
    item: 'Canonical',
    file: '多个非首页文件',
    url: 'N/A',
    reason: `检测到 ${canonicalToHomeCount} 个非首页页面的 canonical 错误指向了首页！`,
    solution: '检查 canonical 生成逻辑，必须保持每页自引用。',
  })
  checklist.canonical = 'FAIL'
} else if (canonicalErrors === 0) {
  checklist.canonical = 'PASS'
} else {
  checklist.canonical = 'FAIL'
}

// ----------------------------------------------------
// 5. Sitemap 安全检查与数量异动波动监控
// ----------------------------------------------------
const sitemapPath = path.join(distDir, 'sitemap.xml')
const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8')
const sitemapUrls = []
const sitemapRegex = /<loc>(https:\/\/duanju\.guide[^<]+)<\/loc>/g
let sMatch
while ((sMatch = sitemapRegex.exec(sitemapContent)) !== null) {
  sitemapUrls.push(sMatch[1])
}

const uniqueSitemapUrls = new Set(sitemapUrls)
const currentSitemapCount = sitemapUrls.length

if (!sitemapContent.startsWith('<?xml')) {
  errors.push({
    item: 'Sitemap',
    file: 'dist/sitemap.xml',
    url: '/sitemap.xml',
    reason: 'Sitemap 文件未以 <?xml 开头，格式不合法！',
    solution: '检查 sitemap 生成工具输出格式。',
  })
  checklist.sitemap = 'FAIL'
} else if (sitemapUrls.some((u) => u.includes('localhost') || u.includes('127.0.0.1') || u.includes('/404') || u.includes('/draft/'))) {
  errors.push({
    item: 'Sitemap',
    file: 'dist/sitemap.xml',
    url: '/sitemap.xml',
    reason: 'Sitemap 中混入了非法开发/测试/404/草稿 URL！',
    solution: '检查 astro.config.mjs 中的 sitemap 过滤配置。',
  })
  checklist.sitemap = 'FAIL'
} else if (uniqueSitemapUrls.size !== currentSitemapCount) {
  errors.push({
    item: 'Sitemap',
    file: 'dist/sitemap.xml',
    url: '/sitemap.xml',
    reason: `Sitemap 存在 ${currentSitemapCount - uniqueSitemapUrls.size} 处重复 URL！`,
    solution: '排查重复路由配置。',
  })
  checklist.sitemap = 'FAIL'
} else {
  // 页面数量异常异动检测 (比对 baseline)
  let prevCount = null
  if (fs.existsSync(baselinePath)) {
    try {
      const base = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'))
      prevCount = base.sitemapUrlCount
    } catch (e) {}
  }

  if (prevCount !== null) {
    const delta = currentSitemapCount - prevCount
    const dropRatio = delta < 0 ? Math.abs(delta) / prevCount : 0
    const spikeRatio = delta > 0 ? delta / prevCount : 0

    if (dropRatio > 0.1) {
      errors.push({
        item: 'PageCount',
        file: 'dist/sitemap.xml',
        url: '/sitemap.xml',
        reason: `页面数量异常暴跌：从 ${prevCount} 暴跌至 ${currentSitemapCount} (下降 ${(dropRatio * 100).toFixed(1)}%)，可能发生大面积路由遗失！`,
        solution: '请仔细核对 content 目录与 slug 配置，确认是否有文件被意外删除。',
      })
      checklist.pageCount = 'FAIL'
    } else if (spikeRatio > 0.5 && prevCount > 20) {
      errors.push({
        item: 'PageCount',
        file: 'dist/sitemap.xml',
        url: '/sitemap.xml',
        reason: `页面数量异常暴增：从 ${prevCount} 暴增至 ${currentSitemapCount} (增加 ${(spikeRatio * 100).toFixed(1)}%)，可能被注入了垃圾页面！`,
        solution: '排查是否有批量脚本错误生成了无意义页面。',
      })
      checklist.pageCount = 'FAIL'
    } else {
      checklist.pageCount = 'PASS'
    }
  } else {
    // 首次运行 baseline 建立基准
    checklist.pageCount = 'PASS'
  }

  checklist.sitemap = 'PASS'
}

// ----------------------------------------------------
// 6. 核心页面 HTTP 200 验证与内部链接全扫描
// ----------------------------------------------------
const coreRoutes = ['/', '/guide/', '/problems/', '/compare/', '/gsy/', '/about/']
let missingCore = false
for (const route of coreRoutes) {
  const expectFile = route === '/' ? path.join(distDir, 'index.html') : path.join(distDir, route.replace(/^\/|\/$/g, ''), 'index.html')
  if (!fs.existsSync(expectFile)) {
    errors.push({
      item: 'CoreURLs',
      file: expectFile,
      url: route,
      reason: `核心 Pillar 专区页面缺失 (对应物理文件未生成)！`,
      solution: `确保 src/pages${route}index.astro 正常编译。`,
    })
    missingCore = true
  }
}
checklist.coreUrls = missingCore ? 'FAIL' : 'PASS'

// 全 HTML 死链与空链接扫描
let brokenLinksCount = 0
let emptyHrefCount = 0
const hrefRegex = /href=["']([^"']+)["']/g

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const rel = path.relative(distDir, file).replace(/\\/g, '/')
  let match
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1].trim()

    if (href === '' || href === '#') {
      // 允许特定的 UI 锚点或无操作交互，但记录警告
      emptyHrefCount++
      continue
    }

    // 只检查内部相对/绝对链接
    if (href.startsWith('/') && !href.startsWith('//')) {
      const urlWithoutHash = href.split('#')[0].split('?')[0]
      if (urlWithoutHash === '') continue

      // 判断对应的本地物理文件
      let targetFile
      if (urlWithoutHash.endsWith('/')) {
        targetFile = path.join(distDir, urlWithoutHash, 'index.html')
      } else if (path.extname(urlWithoutHash) !== '') {
        targetFile = path.join(distDir, urlWithoutHash)
      } else {
        targetFile = path.join(distDir, `${urlWithoutHash}.html`)
      }

      if (!fs.existsSync(targetFile)) {
        // 尝试目录匹配
        const altDir = path.join(distDir, urlWithoutHash, 'index.html')
        if (!fs.existsSync(altDir)) {
          brokenLinksCount++
          errors.push({
            item: 'InternalLinks',
            file: rel,
            url: href,
            reason: `发现内部死链：指向的目标路径不存在 (${urlWithoutHash})`,
            solution: `检查并修正页面内引用的链接地址。`,
          })
        }
      }
    }
  }
}

checklist.internalLinks = brokenLinksCount === 0 ? 'PASS' : 'FAIL'

// ----------------------------------------------------
// 7. 内容重复与 H1 / Title 审查
// ----------------------------------------------------
const titleMap = new Map()
const descMap = new Map()
let dupTitles = 0
let h1Violations = 0

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const rel = path.relative(distDir, file).replace(/\\/g, '/')
  const is404 = file.endsWith('404.html')

  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    const t = titleMatch[1].trim()
    if (titleMap.has(t) && !is404) {
      dupTitles++
      warnings.push(`发现重复 Title: "${t}" 在 ${rel} 与 ${titleMap.get(t)}`)
    } else {
      titleMap.set(t, rel)
    }
  }

  const h1Matches = content.match(/<h1[^>]*>/gi)
  if (!h1Matches || h1Matches.length === 0) {
    h1Violations++
    warnings.push(`页面缺少 <h1> 主标题: ${rel}`)
  } else if (h1Matches.length > 1) {
    h1Violations++
    warnings.push(`页面包含多个 <h1> (${h1Matches.length}个): ${rel}`)
  }
}

checklist.duplicateTitles = dupTitles === 0 ? 'PASS' : 'WARN'

// ----------------------------------------------------
// 8. 结构化数据 Schema JSON-LD 语法校验
// ----------------------------------------------------
let invalidSchemaCount = 0
const schemaRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const rel = path.relative(distDir, file).replace(/\\/g, '/')
  let sMatch
  while ((sMatch = schemaRegex.exec(content)) !== null) {
    const rawJson = sMatch[1].trim()
    try {
      JSON.parse(rawJson)
    } catch (e) {
      invalidSchemaCount++
      errors.push({
        item: 'Schema',
        file: rel,
        url: 'N/A',
        reason: `JSON-LD 语法解析错误: ${e.message}`,
        solution: '检查对应页面的 Schema JSON 序列化逻辑。',
      })
    }
  }
}
checklist.schema = invalidSchemaCount === 0 ? 'PASS' : 'FAIL'

// ----------------------------------------------------
// 9. 防黑产与未知垃圾目录入侵扫描
// ----------------------------------------------------
const spamKeywords = ['casino', 'poker', 'porn', 'xxx', 'viagra', 'lottery', 'baccarat', 'download-hex']
let suspiciousFound = false

function scanSuspicious(dir) {
  const list = fs.readdirSync(dir)
  for (const item of list) {
    const lower = item.toLowerCase()
    for (const kw of spamKeywords) {
      if (lower.includes(kw)) {
        suspiciousFound = true
        errors.push({
          item: 'AntiSpam',
          file: path.join(dir, item),
          url: `/${item}`,
          reason: `发现可疑的外部注入垃圾目录/文件名 (${kw})！`,
          solution: '立即排查本地源码与构建依赖，防止被黑产挂马。',
        })
      }
    }
    const full = path.join(dir, item)
    if (fs.statSync(full).isDirectory()) {
      scanSuspicious(full)
    }
  }
}
scanSuspicious(distDir)
checklist.antiSpam = suspiciousFound ? 'FAIL' : 'PASS'

// ----------------------------------------------------
// 10. IndexNow 凭证就绪检测
// ----------------------------------------------------
const indexNowKeyFile = path.join(distDir, 'c0326462ec5e4f48b945c7ad2a4ef69d.txt')
if (fs.existsSync(indexNowKeyFile)) {
  checklist.indexNow = 'PASS'
} else {
  warnings.push('dist 根目录下未发现 IndexNow 校验 txt 文件')
  checklist.indexNow = 'WARN'
}

// ----------------------------------------------------
// 输出最终检查报告与发布决议
// ----------------------------------------------------
printReport()

function printReport() {
  console.log('\n====================================================')
  console.log('                 SEO HEALTH CHECK                   ')
  console.log('====================================================\n')

  console.log(`Build:            ${checklist.build}`)
  console.log(`Robots:           ${checklist.robots}`)
  console.log(`Noindex:          ${checklist.noindex}`)
  console.log(`Canonical:        ${checklist.canonical}`)
  console.log(`Sitemap:          ${checklist.sitemap}`)
  console.log(`Internal Links:   ${checklist.internalLinks}`)
  console.log(`Core URLs:        ${checklist.coreUrls}`)
  console.log(`Schema:           ${checklist.schema}`)
  console.log(`Duplicate Titles: ${checklist.duplicateTitles}`)
  console.log(`Page Count:       ${checklist.pageCount}`)
  console.log(`Anti-Spam:        ${checklist.antiSpam}`)
  console.log(`IndexNow:         ${checklist.indexNow}\n`)

  console.log('----------------------------------------------------')
  console.log(`[统计] 总静态 HTML 页面数: ${totalHtmlPages}`)
  console.log(`[统计] Sitemap 收录 URL 数: ${currentSitemapCount}`)
  console.log(`[统计] 发现致命阻塞错误: ${errors.length} 处`)
  console.log(`[统计] 发现优化告警建议: ${warnings.length} 处`)
  console.log('----------------------------------------------------\n')

  if (warnings.length > 0) {
    console.log('=== 优化告警提示 (不阻断发布) ===')
    warnings.slice(0, 5).forEach((w, i) => console.log(`  (${i + 1}) ${w}`))
    if (warnings.length > 5) {
      console.log(`  ... 及其他 ${warnings.length - 5} 项`)
    }
    console.log('')
  }

  if (errors.length > 0) {
    console.log('❌ 发现致命 SEO 阻断问题 (STOP_DEPLOY)：')
    errors.forEach((err, i) => {
      console.log(`\n[错误 ${i + 1}] 模块: ${err.item}`)
      console.log(`  - 涉事文件: ${err.file}`)
      console.log(`  - 涉事 URL: ${err.url}`)
      console.log(`  - 错误原因: ${err.reason}`)
      console.log(`  - 修复方案: ${err.solution}`)
    })
    console.log('\n====================================================')
    console.log('RELEASE_DECISION: BLOCKED')
    console.log('====================================================')
    process.exit(1)
  } else {
    // 成功通过，更新基线文件
    const baselineData = {
      lastChecked: new Date().toISOString(),
      totalPages: totalHtmlPages,
      sitemapUrlCount: currentSitemapCount,
      urls: sitemapUrls,
    }
    fs.writeFileSync(baselinePath, JSON.stringify(baselineData, null, 2), 'utf-8')

    console.log('====================================================')
    console.log('RELEASE_DECISION: READY')
    console.log('====================================================')
  }
}
