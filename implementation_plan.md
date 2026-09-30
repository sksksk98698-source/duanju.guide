# 《黄果短剧指南 (duanju.guide) 全站工程实施计划》

## 一、项目定位与目标指标

- **品牌全称**：黄果短剧指南
- **正式域名**：`https://duanju.guide`
- **中文副标**：黄果短剧观看教程与访问问题解决
- **品牌 Slogan**：看黄果，不卡顿
- **核心定位**：黄果短剧入口导航 + 使用教程 + 访问问题解决
- **唯一转化目标**：光速云（`LINKS.GSY_REGISTER`）
- **转化漏斗模型**：
  - **第 1 层（流量获取）**：入口与教程（`/guide/`）、综合对比（`/compare/`），严禁出现光速云推广，纯净获取自然长尾流量，向第 2 层转化桥导流。
  - **第 2 层（转化桥梁）**：访问问题排查（`/problems/`），解决打不开、地区限制、卡顿等痛点，以“网络代理工具排查”为过渡自然引出光速云。
  - **第 3 层（成交终点）**：光速云专区（`/gsy/`），提供套餐对比、适配指引与教程，完成最终转化。
- **技术栈选型**：
  - 核心框架：Astro 5（Static 纯静态生成，首屏秒开）
  - 样式体系：Tailwind CSS + 手写无冗余高质感轻量卡片组件
  - 内容系统：Markdown/MDX + Astro Content Collections 类型校验
  - 搜索引擎：Pagefind（静态构建后索引，零后端开销）
  - SEO 支撑：`@astrojs/sitemap` + `@astrojs/rss` + Schema.org JSON-LD
  - 托管部署：Cloudflare Pages 静态边缘分发

---

## 二、严格合规与数据真实性红线

### 1. 内容合规四不原则（系统强制约束）
- ❌ **严禁描述剧情或具体内容**：不传播、不评价、不描述黄果短剧任何剧集的剧情、画面、演员或具体成人内容细节。
- ❌ **严禁提供直达播放与下载**：不提供任何直接播放源、内嵌播放器、破解下载或盗版资源包。
- ❌ **域名与品牌隔离**：不把黄果官方品牌放进二级域名或误导性主域名。
- ❌ **严禁成人内容物料**：所有文案以技术问题排查与通用网络协议指南展开，恪守纯净技术向。
- ⚠️ **全站强制免责声明**：每页页脚显式展示“本站为独立的黄果短剧观看指南网站，与黄果短剧平台不存在隶属关系。本站不提供任何内容播放、下载或传播服务。仅限 18 岁以上用户访问。”

### 2. 数据真实性第一原则
- 绝对禁止编造虚假测速跑分、伪造节点数量或编造虚假用户使用案例。
- 光速云套餐价格、线路特点统一标记数据来源为“官方资料（2026）”，无实测资料字段标注“待核实”。
- 所有光速云推广链接集中读取 `LINKS.GSY_REGISTER`，带有 `rel="nofollow sponsored noopener"`，并显式标注“含推广链接”。

---

## 三、分阶段执行路线图（13个阶段）

本项目遵循**“阶段推进、构建验证、确认放行”**的严密工程机制。每个阶段代码和文档均落盘写入项目目录，每阶段必须执行 `npm run build` 确保零错误。

```mermaid
flowchart TD
    P1[阶段 1: 架构与策略规划\n三份核心文档编制] -->|用户审核确认| P2[阶段 2: 项目初始化与配置\nAstro5 + Tailwind + 数据层]
    P2 -->|npm run build 通过并确认| P3[阶段 3: 主题与基础布局组件\nBaseLayout + Header + Footer + GSYCTA]
    P3 -->|npm run build 通过并确认| P4[阶段 4: 首页与5大索引页\nHero + 集群分类卡片]
    P4 -->|npm run build 通过并确认| P5[阶段 5: 内容系统与动态路由\nContent Collections + [...slug].astro]
    P5 -->|npm run build 通过并确认| P6[阶段 6: 入口与教程集群 15篇\n/guide/ P1 纯净长尾流量]
    P6 -->|npm run build 通过并确认| P7[阶段 7: 访问问题转化桥 18篇\n/problems/ P0 核心转化桥]
    P7 -->|npm run build 通过并确认| P8[阶段 8: 对比与安全评测 12篇\n/compare/ P2 选型与安全]
    P8 -->|npm run build 通过并确认| P9[阶段 9: 光速云成交专区 10篇\n/gsy/ P0 套餐/教程/场景]
    P9 -->|npm run build 通过并确认| P10[阶段 10: 站点合规与声明 4篇\n/about/ P3 隐私/条款/披露]
    P10 -->|npm run build 通过并确认| P11[阶段 11: 全站 SEO 与内链闭环\nSchema 标记 + 面包屑 + 漏斗内链]
    P11 -->|npm run build 通过并确认| P12[阶段 12: QA 综合审核报告\n生成 QA-REPORT.md 逐项审查]
    P12 -->|npm run build 通过并确认| P13[阶段 13: 搜索索引与部署就绪\nPagefind 验证 + Cloudflare 文档]
```

### 详细阶段工作内容与验收标准

#### 阶段 1：架构规划与策略设计（当前阶段）
- **产出文件**：
  - `implementation_plan.md`（实施方案总纲）
  - `content-map.md`（约60篇原创文章完整关键词与集群地图）
  - `conversion-funnel.md`（三层转化漏斗与内链拓扑矩阵）
- **验收标准**：
  - 文档完整覆盖 5 个一级导航与各三级集群。
  - 漏斗规则明确：第 1 层绝不出现光速云，第 2 层转化桥承接，第 3 层完成转化。
  - 等待用户审批确认。

#### 阶段 2：项目初始化与底层构建
- **工作内容**：
  - 使用 `npm` 初始化 Astro 5 项目，安装 `@astrojs/tailwind`、`@astrojs/sitemap`、`@astrojs/rss`、`@astrojs/mdx`、`pagefind`。
  - 配置 `astro.config.mjs`（绑定域名 `https://duanju.guide`，配置 sitemap 过滤与 mdx）。
  - 配置 `tsconfig.json` 与 `package.json`（集成 build 流程与 pagefind）。
  - 创建配置模块：`src/consts.ts`、`src/config/links.ts`。
  - 创建基础样式：`src/styles/global.css`（简白质感主题，响应式与 CSS 变量）。
  - 创建 SEO 基础：`public/robots.txt`、`public/logo.svg`、`public/favicon.ico`。
  - 创建数据层与类型：`src/types/gsy.ts`、`src/data/gsy.json`。
- **验收标准**：运行 `npm run build`，编译成功且无警告错误。

#### 阶段 3：主题系统与全站基础组件
- **工作内容**：
  - 布局模板：
    - `src/layouts/BaseLayout.astro`（全局元数据、OG 标签、Twitter Card、主题容器、页头页脚插槽）
    - `src/layouts/ArticleLayout.astro`（GEO 格式标准排版、面包屑、目录导航、更新时间与作者/合规标注）
    - `src/layouts/ProblemLayout.astro`（针对转化桥特化的 6 步法排版模板，含高亮排查步骤与推荐位）
  - 核心组件：
    - `src/components/Header.astro`（响应式导航、移动端汉堡折叠、搜索快捷键入口）
    - `src/components/Footer.astro`（全站 18+ 声明、免责声明、内链栏目与版权信息）
    - `src/components/Search.astro`（Pagefind 前端弹窗组件，带快捷键 ⌘K/Ctrl+K 支持）
    - `src/components/Card.astro`（高质感手写卡片，无模板化阴影与圆角设计）
    - `src/components/GSYCTA.astro`（光速云专用转化组件，包含醒目“含推广链接”徽标、套餐对比与直达注册按钮）
    - `src/components/SafetyNotice.astro`（合规与安全防范提示框）
- **验收标准**：运行 `npm run build`，组件间无循环引用与样式丢失。

#### 阶段 4：首页与一级导航索引页
- **工作内容**：
  - `src/pages/index.astro`：Hero 区域明确露出完整域名 `duanju.guide`，三列高转化功能区，最新指南与核心问题排查直通车。
  - `src/pages/guide/index.astro`：入口与教程聚合大厅，按 5 大主题展示 15 篇指引。
  - `src/pages/problems/index.astro`：常见故障排查中心，直击打不开、卡顿、地区限制等高意图搜索。
  - `src/pages/compare/index.astro`：观看方式与网络方案客观对比中心。
  - `src/pages/gsy/index.astro`：光速云专区导航页，清晰陈列节点规格、套餐价格与适用场景。
  - `src/pages/about/index.astro`：关于我们与独立第三方免责声明导航。
  - `src/pages/404.astro`：友好 404 引导页。
- **验收标准**：运行 `npm run build`，所有核心索引页编译产出正常。

#### 阶段 5：内容路由与动态渲染管道
- **工作内容**：
  - 创建 `src/content.config.ts`（适配 Astro 5 Content Layer API，利用 `glob` 收集各类内容）。
  - 创建全站通用动态路由 `src/pages/[...slug].astro`，支持根据文章类型自适应渲染 `ArticleLayout` 或 `ProblemLayout`。
  - 搭建集合 schema 校验规则（title, description, pubDate, updatedDate, category, cluster, intent, priority, tags 等）。
- **验收标准**：运行 `npm run build` 验证 content loader 与路由匹配。

#### 阶段 6：入口与教程内容集群（/guide/ 15篇）
- **工作内容**：
  - 官方入口类（3篇）：最新地址指引、防伪防走丢、域名识别技巧。
  - 下载安装类（3篇）：iOS 步骤、Android 安装、桌面端网页访问配置。
  - 基础使用类（3篇）：界面导航、基本设置、缓存清理操作。
  - 账号与登录类（3篇）：注册排查、验证码收取故障、多设备登录须知。
  - 常见 FAQ 类（3篇）：资费政策释疑、画质调整指南、网络环境基础要求。
  - **重要原则**：绝不出现光速云关键词与外链，正文埋设向 `/problems/` 转化桥的自然内链。
- **验收标准**：15 篇文章全部撰写完毕，内容原创客观每篇不少于 500 字，`npm run build` 成功。

#### 阶段 7：访问问题解决内容集群（/problems/ 18篇，转化桥）
- **工作内容**：
  - 打不开排查（3篇）：DNS污染排查、网络无法连接、白屏卡死解决方案。
  - 地区限制排查（3篇）：地域屏蔽提示、跨区网络策略、IP洁净度对访问的影响。
  - 转圈卡顿排查（3篇）：短剧加载缓冲、高峰期延迟、节点吞吐量排查。
  - App闪退排查（3篇）：系统兼容性、证书失效、网络握手超时引发闪退。
  - 加载缓慢排查（3篇）：CDN分配异常、ISP限速、专线与普通公网速度差异。
  - 无法访问排查（3篇）：错误代码识别、安全证书报错、网络环境重置指南。
  - **转化设计**：统一采用 6 步法 GEO 结构，文末引入 `GSYCTA` 组件，合规标注推广披露。
- **验收标准**：18 篇转化桥文章全部落盘，`npm run build` 编译成功。

#### 阶段 8：对比与安全评测内容集群（/compare/ 12篇）
- **工作内容**：
  - 平台差异对比（3篇）：黄果 vs 红果商业模式、受众定位及技术特点对比。
  - 观看方式对比（3篇）：网页端 vs 客户端 vs 第三方聚合体验优劣。
  - 网络方案对比（3篇）：免费加速器 vs 普通VPN vs 商业专线（光速云）架构及延迟客观分析。
  - 安全合规对比（3篇）：公共网络钓鱼风险、山寨App盗号隐患、隐私防护准则。
- **验收标准**：12 篇文章完整落地，`npm run build` 编译成功。

#### 阶段 9：光速云专区深度内容（/gsy/ 10篇）
- **工作内容**：
  - 品牌与架构介绍（2篇）：光速云运营概况、IEPL专线及技术原理介绍。
  - 套餐对比与选型（2篇）：轻量版 vs 极速版规格横评、性价比选购建议。
  - 跨端客户端教程（2篇）：Windows/macOS/iOS/Android 订阅配置保姆级图文引导。
  - 短剧观看专属适配（2篇）：低延迟节点挑选、流媒体解锁测试说明、防卡顿专属配置。
  - 售后与常见故障（2篇）：节点不可用自检、续费升级答疑、常见客户端报错处理。
  - **合规标准**：所有数据标明来自官方资料（2026），带有赞助推广披露。
- **验收标准**：10 篇高转化深度文章落地，`npm run build` 编译成功。

#### 阶段 10：关于、声明与法律合规（/about/ 4篇）
- **工作内容**：
  - `src/content/about/index.md`：站点定位、非官方独立声明。
  - `src/content/about/privacy.md`：严密的隐私政策（零日志、Cookie 规范）。
  - `src/content/about/terms.md`：服务条款（18+ 年龄限制、合规守则）。
  - `src/content/about/disclosure.md`：推广合作披露与免责声明，明确佣金机制。
- **验收标准**：4 篇合规文档全部就绪，`npm run build` 编译成功。

#### 阶段 11：全站 SEO、JSON-LD Schema 与内链矩阵闭环
- **工作内容**：
  - 注入 Article Schema（包含 headline, datePublished, dateModified, author, publisher）。
  - 注入 BreadcrumbList Schema（层级导航结构化数据）。
  - 为所有 FAQ 注入 FAQPage Schema。
  - 全站内链网络严格按照 `conversion-funnel.md` 对齐，执行死链和断链自动化检查。
- **验收标准**：运行 `npm run build`，页面生成的结构化数据通过 Google Rich Results 规范校验无报错。

#### 阶段 12：QA 综合审核报告编制
- **工作内容**：
  - 生成 `QA-REPORT.md`，执行 9 项专项审查：
    1. 真实性审核：无编造价格和跑分。
    2. 安全合规审核：无剧情描述、无成人涉黄、无盗播下载。
    3. 转化漏斗审核：第 1 层纯净，第 2 层顺利桥接，第 3 层完成落地。
    4. 推广链接审核：集中读取且统一带有 sponsored 标签与文字披露。
    5. 关键词防蚕食审核：各页面主词唯一，长尾词各司其职。
    6. 移动端体验审核：导航收缩、弹窗适配、触控区域良好。
    7. Schema 一致性：结构化数据与页面可见文本 100% 吻合。
    8. 搜索引擎收录项：Sitemap 包含全站合法公开页面，Robots 配置正确。
    9. 构建稳定性：生产产物大小与编译时间正常。
- **验收标准**：`QA-REPORT.md` 审核清单全部打钩，运行 `npm run build` 100% 通过。

#### 阶段 13：Pagefind 索引生成与 Cloudflare Pages 交付验收
- **工作内容**：
  - 验证构建命令 `npm run build`（自动衔接 `astro build && pagefind --site dist`）。
  - 验证本地预览 `npm run preview` 或 `npm run dev`，测试搜索功能弹窗即时打字返回结果。
  - 编写详细的 `DEPLOYMENT.md`，指导用户在 Cloudflare Pages 绑定 GitHub 进行自动化静态构建。
- **验收标准**：本地搜索可用，构建产物完整，交付可直接上线的生产代码。

---

## 四、验证与命令规范

- **安装依赖**：`npm install`
- **本地调试**：`npm run dev`
- **生产构建与搜索索引**：`npm run build`
- **本地生产产物预览**：`npm run preview`
