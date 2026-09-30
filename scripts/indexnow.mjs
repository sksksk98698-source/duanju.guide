import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const HOST = 'duanju.guide'
const KEY = 'c0326462ec5e4f48b945c7ad2a4ef69d'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const SITEMAP_PATH = path.join(rootDir, 'dist', 'sitemap.xml')
const BASELINE_PATH = path.join(rootDir, 'scripts', 'seo-baseline.json')

const isDryRun = process.argv.includes('--dry-run')
const submitAll = process.argv.includes('--all')

console.log('====================================================')
console.log('   DUANJU.GUIDE IndexNow 搜索引擎主动提交通知工具')
console.log('====================================================')

// 1. 读取当前 sitemap.xml
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('[ERROR] dist/sitemap.xml 不存在，请先执行 npm run build！')
  process.exit(1)
}

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8')
const allUrls = []
const urlRegex = /<loc>(https:\/\/duanju\.guide[^<]+)<\/loc>/g
let match
while ((match = urlRegex.exec(sitemapContent)) !== null) {
  allUrls.push(match[1])
}

console.log(`[INFO] 当前 Sitemap 共检索到 ${allUrls.length} 个规范 URL`)

let targetUrls = []

if (submitAll) {
  targetUrls = allUrls
  console.log(`[MODE] 全量提交模式 (--all)：准备提交全部 ${targetUrls.length} 个 URL`)
} else {
  // 增量比较模式：比对 baseline 中的历史 URL 列表
  let baselineUrls = []
  if (fs.existsSync(BASELINE_PATH)) {
    try {
      const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'))
      baselineUrls = baseline.urls || []
    } catch (e) {
      console.warn('[WARN] 解析 baseline 失败，将采用核心页面提交')
    }
  }

  const baselineSet = new Set(baselineUrls)
  const newUrls = allUrls.filter((u) => !baselineSet.has(u))

  if (newUrls.length > 0) {
    targetUrls = newUrls
    console.log(`[MODE] 增量发现模式：检测到 ${newUrls.length} 个新增 URL:`)
    newUrls.forEach((u) => console.log(`  + ${u}`))
  } else {
    // 若无增量，默认提交核心 Hub 页面刷新索引
    targetUrls = [
      `https://${HOST}/`,
      `https://${HOST}/guide/`,
      `https://${HOST}/problems/`,
      `https://${HOST}/compare/`,
      `https://${HOST}/gsy/`,
      `https://${HOST}/about/`,
    ]
    console.log(`[MODE] 日常刷新模式：提交 ${targetUrls.length} 个核心 Pillar 页面`)
  }
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: targetUrls,
}

if (isDryRun) {
  console.log('[DRY-RUN] 模拟提交模式，不发起真实网络请求。Payload 内容预览:')
  console.log(JSON.stringify(payload, null, 2))
  console.log('[PASS] IndexNow 校验通过 (Dry-Run)')
  process.exit(0)
}

// 发起真实 POST 请求至 IndexNow API
function submitToIndexNow(apiHost, apiPath) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(payload)
    const options = {
      hostname: apiHost,
      port: 443,
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 10000,
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`[SUCCESS] IndexNow 提交成功 (${apiHost}): HTTP ${res.statusCode}`)
          resolve(true)
        } else {
          console.warn(`[WARN] IndexNow 返回状态码 (${apiHost}): HTTP ${res.statusCode}, 响应: ${data}`)
          resolve(false)
        }
      })
    })

    req.on('error', (e) => {
      console.warn(`[NOTICE] 无法连接到 ${apiHost} (${e.message})，可能受限于当前网络环境，不影响构建部署。`)
      resolve(false)
    })

    req.on('timeout', () => {
      req.destroy()
      console.warn(`[NOTICE] 连接 ${apiHost} 超时，跳过在线推送。`)
      resolve(false)
    })

    req.write(postData)
    req.end()
  })
}

async function run() {
  console.log(`[INFO] 正在向 IndexNow 官方网关推送 ${targetUrls.length} 个 URL...`)
  await submitToIndexNow('api.indexnow.org', '/indexnow')
  console.log('====================================================')
  console.log('>>> IndexNow 主动提交处理流程完毕 <<<')
  console.log('====================================================')
}

run()
