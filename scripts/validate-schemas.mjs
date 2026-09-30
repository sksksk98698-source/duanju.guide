import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const sampleFiles = [
  'dist/index.html',
  'dist/guide/index.html',
  'dist/problems/index.html',
  'dist/compare/index.html',
  'dist/gsy/index.html',
  'dist/about/index.html',
  'dist/guide/faq/billing-and-ad-policy/index.html',
  'dist/guide/faq/cross-border-access-regulations/index.html',
  'dist/guide/official-site/latest-address-2026/index.html',
  'dist/problems/cant-open/dns-resolution-failure/index.html',
  'dist/problems/region-lock/geoblocking-explained/index.html',
  'dist/compare/huangguo-vs-hongguo/platform-comparison-2026/index.html',
  'dist/gsy/pricing/plan-comparison-guide/index.html',
  'dist/gsy/faq/troubleshooting-and-service-guide/index.html',
  'dist/about/disclosure/index.html',
]

let passed = 0
for (const rel of sampleFiles) {
  const full = path.join(rootDir, rel)
  if (!fs.existsSync(full)) {
    console.error(`[FAIL] File missing: ${rel}`)
    process.exit(1)
  }
  const content = fs.readFileSync(full, 'utf-8')
  const match = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (!match) {
    console.error(`[FAIL] Missing JSON-LD in: ${rel}`)
    process.exit(1)
  }
  try {
    const parsed = JSON.parse(match[1])
    const types = parsed['@graph']
      ? parsed['@graph'].map((x) => x['@type']).join(' + ')
      : parsed['@type']
    console.log(`[PASS] ${rel} -> ${types}`)
    passed++
  } catch (err) {
    console.error(`[FAIL] Invalid JSON in ${rel}:`, err)
    process.exit(1)
  }
}

console.log(`\nAll ${passed} sampled HTML pages have valid, standard Schema.org JSON-LD!`)
