export const SITE = {
  title: '黄果短剧指南',
  subtitle: '黄果短剧观看教程与访问问题解决',
  description: '黄果短剧入口导航、使用教程、访问问题解决、网络方案',
  url: 'https://duanju.guide',
  slogan: '看黄果，不卡顿',
  locale: 'zh-CN',
  author: '黄果短剧指南技术评测组',
  nav: [
    { text: '入口与教程', link: '/guide/' },
    { text: '访问问题', link: '/problems/' },
    { text: '对比与安全', link: '/compare/' },
    { text: '光速云', link: '/gsy/' },
    { text: '关于', link: '/about/' },
  ],
  footer: {
    disclaimer: '本站为独立的黄果短剧观看指南网站，与黄果短剧平台不存在隶属关系。本站不提供任何内容播放、下载或传播服务。仅限 18 岁以上用户访问。',
    copyright: '© 2026 黄果短剧指南 · duanju.guide',
  },
  // 搜索引擎站长平台验证代码预留 (支持环境变量或直接在此填入)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    bing: process.env.BING_SITE_VERIFICATION || '',
    baidu: process.env.BAIDU_SITE_VERIFICATION || '',
    shenma: process.env.SHENMA_SITE_VERIFICATION || '',
  },
} as const
