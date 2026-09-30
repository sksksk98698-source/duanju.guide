# 黄果短剧指南 (duanju.guide) Cloudflare Pages 生产部署与运维手册

> **站点域名**：`https://duanju.guide`  
> **推荐托管平台**：**Cloudflare Pages**（全球 Anycast 边缘网络、免费高防 DDoS、全球毫秒级 TTFB）  
> **构建产物**：Astro 5 纯静态 HTML/CSS/JS + Pagefind 静态全文检索库  
> **构建输出目录**：`dist`

---

## 目录
1. [项目部署概况与前置要求](#一项目部署概况与前置要求)
2. [部署方式 A：Git 联动自动持续集成 (推荐)](#二部署方式-a-git-联动自动持续集成-推荐)
3. [部署方式 B：Wrangler 命令行一键直传](#三部署方式-b-wrangler-命令行一键直传)
4. [自定义域名绑定 (duanju.guide)](#四自定义域名绑定-duanjuguide)
5. [Cloudflare 性能与安全黄金配置](#五cloudflare-性能与安全黄金配置)
6. [生产环境验证与测试清单](#六生产环境验证与测试清单)
7. [搜索引擎提交与收录加速 (SEO)](#七搜索引擎提交与收录加速-seo)
8. [日常内容维护与更新指引](#八日常内容维护与更新指引)

---

## 一、项目部署概况与前置要求

### 1.1 构建核心参数
在任何云平台配置构建步骤时，请统一使用以下参数：

| 配置项 | 参数值 | 说明 |
| :--- | :--- | :--- |
| **Framework Preset** | `Astro` | 平台预设框架选择 Astro |
| **Build Command** | `npm run build` | 自动执行 `astro build && pagefind --site dist` |
| **Build Output Directory** | `dist` | 编译后生成的纯静态根目录 |
| **Node.js Version** | `>= 20.0.0` (推荐 `20` 或 `22`) | 建议在环境变量中指定 `NODE_VERSION=20` |

### 1.2 生产文件树特点
- 根目录包含 `index.html`、`404.html`、`robots.txt`、`sitemap-index.xml`、`sitemap-0.xml`；
- `_headers` 文件：自动为静态资源（`/_astro/*`）、Pagefind 检索包（`/pagefind/*`）配置缓存与安全标头；
- `pagefind/` 目录：包含编译好的 WebAssembly 检索索引库与 UI 交互脚本。

---

## 二、部署方式 A：Git 联动自动持续集成 (推荐)

这是最推荐的生产部署方式。每次在本地修改内容并 `git push` 后，Cloudflare Pages 会在 1 分钟内自动触发构建、索引并全球分发。

### 步骤 1：本地仓库初始化与提交
在项目根目录 `c:\Users\Pro User\Desktop\duanju.guide` 打开终端，执行：

```bash
# 1. 初始化 Git 仓库
git init

# 2. 暂存所有文件（已配置好 .gitignore）
git add .

# 3. 提交初始版本
git commit -m "feat: complete huangguo short drama guide (duanju.guide) production release"

# 4. 关联您的 GitHub 或 GitLab 仓库（以 GitHub 为例）
git branch -M main
git remote add origin https://github.com/您的用户名/duanju-guide.git

# 5. 推送代码
git push -u origin main
```

### 步骤 2：在 Cloudflare Dashboard 中创建 Pages 项目
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)；
2. 在左侧导航栏点击 **Workers & Pages** -> **Create application**；
3. 选择 **Pages** 选项卡，点击 **Connect to Git**；
4. 授权并选择刚刚创建的 `duanju-guide` 仓库；
5. 进入构建配置页面，填写：
   - **Project name**: `duanju-guide`（或自定义）
   - **Production branch**: `main`
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 展开 **Environment variables (advanced)**，添加环境变量：
   - Variable name: `NODE_VERSION`
   - Value: `20`
7. 点击 **Save and Deploy**。构建流程通常在 40~60 秒内完成，您将获得一个形如 `duanju-guide.pages.dev` 的预览域名。

---

## 三、部署方式 B：Wrangler 命令行一键直传

若不想关联 Git 仓库，可直接使用 Cloudflare 官方 CLI 工具 `wrangler` 将本地构建物推送到边缘节点：

### 步骤 1：本地执行生产构建
```bash
npm run build
```
确保控制台显示构建成功，`dist/` 目录下已生成 66 个 HTML 页面和 `dist/pagefind/` 索引。

### 步骤 2：登录并直传部署
```bash
# 登录 Cloudflare 账户（首次执行会自动拉起浏览器授权）
npx wrangler login

# 将 dist 目录直接部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=duanju-guide
```

---

## 四、自定义域名绑定 (duanju.guide)

### 步骤 1：添加自定义域名
1. 在 Cloudflare Pages 项目概览页面，点击 **Custom domains** 选项卡；
2. 点击 **Set up a custom domain**；
3. 输入您的品牌根域名：`duanju.guide`，点击 **Continue**；
4. 再次点击 **Set up a custom domain**，添加 `www.duanju.guide`；

### 步骤 2：DNS 记录配置
- **情况 1：域名 DNS 解析由 Cloudflare 托管（推荐）**：
  - Cloudflare 会自动为您创建 CNAME 扁平化解析记录，无需手动干预，几秒钟内即可生效。
- **情况 2：域名在腾讯云 / 阿里云 / Namecheap / GoDaddy 解析**：
  - 前往您的域名服务商后台，添加两条 CNAME 记录：
    - 主机记录 `@` -> CNAME 指向 `duanju-guide.pages.dev`
    - 主机记录 `www` -> CNAME 指向 `duanju-guide.pages.dev`

---

## 五、Cloudflare 性能与安全黄金配置

为保障 `duanju.guide` 的抗攻击能力与全球访问速度，建议在 Cloudflare 域名控制面板中开启以下配置：

### 1. SSL/TLS 加密设置
- 路径：`SSL/TLS` -> `Overview`
- 将加密模式设置为：**Full (strict)**（严格加密）；
- 路径：`SSL/TLS` -> `Edge Certificates`
  - **Always Use HTTPS**：开启（强制所有 HTTP 请求 301 重定向至 HTTPS）；
  - **Automatic HTTPS Rewrites**：开启；
  - **Minimum TLS Version**：建议设为 `TLS 1.2`；
  - **TLS 1.3**：开启。

### 2. 速度与网络协议优化
- 路径：`Speed` -> `Optimization`
  - **Brotli 压缩**：开启（减小 HTML/CSS/JS 传输体积 20%~30%）；
  - **Early Hints**：开启（加速静态资源预加载）；
- 路径：`Network`
  - **HTTP/3 (with QUIC)**：开启（显著提升移动端高丢包弱网环境下的首屏打开速度）；
  - **0-RTT Connection Resumption**：开启（实现第二次握手 0 延迟恢复连接）。

### 3. 根域名与 www 规范重定向 (避免权重分散)
建议将 `www.duanju.guide` 统一 301 重定向到根域名 `https://duanju.guide`：
- 路径：`Rules` -> `Redirect Rules`
- 规则名称：`Redirect WWW to Apex`
- 匹配条件：`Hostname eq "www.duanju.guide"`
- 目标 URL：`https://duanju.guide/$1`（动态保留路径）
- 状态代码：`301 (Permanent Redirect)`。

---

## 六、生产环境验证与测试清单

在正式对外推广前，请按照以下清单对线上站点进行逐项点检：

- [ ] **1. HTTPS 访问**：访问 `https://duanju.guide`，浏览器地址栏显示安全锁，证书有效；
- [ ] **2. HTTP 自动重定向**：访问 `http://duanju.guide`，应自动跳转为 `https://duanju.guide`；
- [ ] **3. 首页与 5 大专区正常浏览**：
  - 首页：`/`
  - 入口与教程：`/guide/`
  - 访问问题解决：`/problems/`
  - 对比与安全：`/compare/`
  - 光速云专区：`/gsy/`
  - 关于与合规：`/about/`
- [ ] **4. 404 自定义页面拦截**：
  - 访问一个不存在的测试页面（如 `https://duanju.guide/random-test-page-404/`），页面应正常呈现本站专属 404 引导页，且 HTTP 响应头返回状态码 `404`；
- [ ] **5. Pagefind 客户端全文搜索**：
  - 点击页面右上角“搜索指南”或按下快捷键 `⌘K` / `Ctrl+K`；
  - 输入“打不开”、“地区限制”、“光速云”、“99元”等关键词，搜索框应在 20ms 内即时列出高亮匹配结果，点击能够准确跳转；
- [ ] **6. 联盟推广链接跳转验证**：
  - 前往任一问题排查页（如 `/problems/cant-open/dns-resolution-failure/`）或光速云专区页（如 `/gsy/pricing/plan-comparison-guide/`）；
  - 点击带有“含推广链接”标签的 CTA 按钮；
  - 检查链接是否在新标签页打开，且目标地址携带专属联盟跟踪参数：`https://sahude.gsyvipaff.com/#/?code=keqgvT5Y`；
- [ ] **7. 移动端菜单与交互**：
  - 使用手机或开启 Chrome 开发者工具移动端模式（375px/390px 视口）；
  - 点击汉堡按钮展开抽屉导航，测试各专区点击体验与排版是否无横向滚动条。

---

## 七、搜索引擎提交与收录加速 (SEO)

### 7.1 核心提交资产
- **Robots 文件**：`https://duanju.guide/robots.txt`
- **Sitemap 索引**：`https://duanju.guide/sitemap-index.xml`
- **子地图地址**：`https://duanju.guide/sitemap-0.xml`

### 7.2 Google Search Console 提交指南
1. 访问 [Google Search Console](https://search.google.com/search-console)；
2. 选择 **网址前缀 (URL prefix)** 验证方式，输入 `https://duanju.guide`；
3. 选择 **HTML 标记** 或 **DNS TXT 记录** 方式完成站长权限所有权验证；
4. 进入控制台左侧 **站点地图 (Sitemaps)**；
5. 在“添加新的站点地图”中输入：`sitemap-index.xml`，点击 **提交**；
6. 状态显示为“成功”后，Google 将按既定计划爬取全站 65 个核心页面。

### 7.3 Bing Webmaster Tools 提交
1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters)；
2. 点击“从 Google Search Console 直接导入”即可一秒完成同步验证；
3. 在“Sitemaps”中确认 `sitemap-index.xml` 处于已提交状态。

---

## 八、日常内容维护与更新指引

### 8.1 增补新文章流程
本站基于 Astro 5 Content Collections 驱动，增补新文章极为便捷：

1. **新建 Markdown 文件**：
   - 若要新增一篇指南教程，在 `src/content/guide/新分类/新文章名.md` 创建文件；
   - 若要新增一篇故障排查，在 `src/content/problems/新分类/新文章名.md` 创建文件。
2. **规范 Frontmatter 头部元数据**：
   ```yaml
   ---
   title: "文章主标题（含核心关键词）"
   description: "文章摘要说明（用于搜索结果展示，80-140字）"
   pubDate: "2026-03-01"
   updatedDate: "2026-09-30"
   category: "guide"
   categoryName: "入口与教程"
   keywords: ["核心词1", "长尾词2"]
   priority: "P1"
   showGSY: false # 严格注意：/guide/ 文章必须保持 false
   ---
   ```
3. **本地开发预览与质检**：
   ```bash
   # 启动本地热更新服务器
   npm run dev

   # 运行内置质检脚本核验死链与合规性
   node scripts/audit-links.mjs
   node scripts/qa-check.mjs

   # 本地完整构建与预览
   npm run build
   npm run preview
   ```
4. **推送 Git 触发全自动生产构建**：
   ```bash
   git add .
   git commit -m "docs: add new troubleshooting guide for xyz"
   git push origin main
   ```
   Cloudflare Pages 会在数秒内自动拉取更新，重新生成静态 HTML 及全文索引，无需人工重启或刷新服务器。

---
*文档版本：v1.0.0 (生产就绪)*  
*更新日期：2026-09-30*
