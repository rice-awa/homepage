export const SITE = {
  title: 'riceawa — Creative Developer',
  description: 'riceawa 的个人作品集 — 全栈开发者 / 创造有温度的技术体验',
  locale: 'zh_CN',
  url: 'https://rice-awa.top',
  author: 'riceawa',
  twitterHandle: '@riceawa',
};

export const SEO_KEYWORDS = [
  'riceawa', '全栈开发', 'Minecraft', 'AI Agent', '前端',
  'Python', 'React', 'TypeScript', '创意开发者', '开源',
];

export const NAV = {
  logo: 'RICE—AWA',
  links: [
    { label: 'WORKS', href: '#works' },
    { label: 'STACK', href: '#stack' },
    { label: 'ACTIVITY', href: '#activity' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ],
};

export const HERO = {
  eyebrow: 'CREATIVE DEVELOPER — 创意开发者',
  title: 'RICEAWA',
  stroke: 'FULL-STACK',
  cn: {
    prefix: '用代码构建有趣的体验 —— 从 ',
    highlights: ['Minecraft 模组', 'AI Agent'],
    suffix: '，从浏览器到服务器。',
  },
  coord: 'PORTFOLIO © 2023—2026 / FULL-STACK × CREATIVE',
  socials: [
    { label: 'GITHUB ↗', href: 'https://github.com/rice-awa' },
    { label: 'BILIBILI ↗', href: 'https://space.bilibili.com/521856101' },
    { label: 'BLOG ↗', href: 'https://blog.rice-awa.top' },
  ],
};

export const MANIFESTO = {
  tag: { num: '01', en: 'MANIFESTO', cn: '创作宣言' },
  lines: [
    { en: ['WRITE ', 'CODE', ','], accentIdx: 1, cn: '把想法变成可运行的现实' },
    { en: ['CRAFT ', 'WORLDS', ','], accentIdx: 1, cn: '在像素与协议之间造世界' },
    { en: ['SHARE ', 'WONDER', '.'], accentIdx: 1, cn: '把好奇心开源给每一个人' },
  ],
  foot: {
    prefix: '我相信代码是一种创作媒介。从 ',
    highlights: ['Minecraft 的方块世界', '大语言模型的推理边界'],
    suffix: '，我持续在「工程」与「趣味」的交汇处建造东西 —— 然后把过程分享出来。',
  },
};

export const WORKS = {
  tag: { num: '02', en: 'SELECTED WORKS', cn: '精选作品' },
  title: {
    line1: '建造过的一些',
    line2: '有趣的东西',
  },
  desc: '真实上线、真实用户在用的项目 —— 从游戏模组到 AI 系统，每一个都从「自己想要用」开始。',
  items: [
    {
      id: 'mcbe-ai-agent',
      num: '01',
      name: 'MCBE AI Agent',
      year: '2026',
      tags: ['PYTHON', 'PYDANTICAI', 'WEBSOCKET', 'MCP'],
      desc: 'Minecraft 基岩版的 AI Agent：异步消息队列解耦、多 LLM 支持、流式输出与多人会话隔离，让 AI 真正「住进」服务器。',
      link: 'https://github.com/rice-awa',
      image: '/assets/mcbe-ai-agent-hero.webp',
    },
    {
      id: 'lumichat',
      num: '02',
      name: 'LumiChat',
      year: '2026',
      tags: ['JAVA', 'FABRIC', 'LLM', 'TOOL-CALL'],
      desc: 'Minecraft Fabric 模组，把 LLM 聊天带入游戏：13 个游戏内工具调用、热编辑提示词模板、多 Provider 健康检查。',
      link: 'https://github.com/riceawa/LumiChat',
      image: '/assets/lumichat-hero.webp',
    },
    {
      id: 'ffmpeg-web',
      num: '03',
      name: 'FFmpeg Web Tool',
      year: '2025',
      tags: ['JAVASCRIPT', 'WEBASSEMBLY', 'FFMPEG'],
      desc: '把 FFmpeg 编译进浏览器：音视频转码、压缩、裁剪全部本地完成，文件不上传，隐私零风险。',
      link: 'https://github.com/rice-awa',
      coverGen: { line1: 'FFMPEG', line2: 'WEB', cg: 'rgba(34,211,238,.30)', cgStrong: '#22d3ee', meta: ['WEBASSEMBLY / IN-BROWSER', 'MEDIA TOOL / 2025'] },
    },
    {
      id: 'essay-grader',
      num: '04',
      name: 'AI Essay Grader',
      year: '2024',
      tags: ['PYTHON', 'FLASK', 'LANGCHAIN'],
      desc: 'AI 英语作文自动批改系统：多维度评分、逐句修改建议，把老师从重复劳动里解放出来。',
      link: 'https://github.com/rice-awa',
      coverGen: { line1: 'ESSAY', line2: 'GRADER', cg: 'rgba(96,165,250,.30)', cgStrong: '#60a5fa', meta: ['FLASK / LANGCHAIN', 'AI EDUCATION / 2024'] },
    },
    {
      id: 'rice-awa-top',
      num: '05',
      name: 'rice-awa.top',
      year: '2024',
      tags: ['NEXT.JS', 'TYPESCRIPT', 'TAILWIND'],
      desc: '个人主页与工具集合：深色模式、项目展示、实用小工具，是我试验新技术的自留地。',
      link: 'https://rice-awa.top',
      coverGen: { line1: 'RICE-AWA', line2: '.TOP', cg: 'rgba(45,212,191,.30)', cgStrong: '#2dd4bf', meta: ['NEXT.JS / TYPESCRIPT', 'PERSONAL SITE / 2024'] },
    },
  ],
  outro: {
    line1: '还有更多',
    line2: '在 GitHub 上 →',
    linkLabel: 'EXPLORE ALL REPOS ↗',
    link: 'https://github.com/rice-awa',
  },
};

export const STACK = {
  tag: { num: '03', en: 'STACK', cn: '技术栈' },
  marquee1: ['REACT', 'NEXT.JS', 'TYPESCRIPT', 'TAILWIND CSS', 'GSAP', 'MOTION', 'CANVAS'],
  marquee2: ['PYTHON', 'NODE.JS', 'FLASK', 'DOCKER', 'LINUX', 'GIT', 'LLM / AGENT'],
  foot: [
    { label: '前端：', text: 'React / Next.js / TypeScript / Tailwind CSS / GSAP —— 追求「好看」与「好用」同时成立。' },
    { label: '后端 & 工具：', text: 'Python / Node.js / Flask / Docker / Linux / Git —— 从原型到部署的全链路。' },
  ],
};

export const ACTIVITY = {
  tag: { num: '04', en: 'OPEN SOURCE ACTIVITY', cn: '开源贡献' },
  username: 'rice-awa',
  totalLabel: 'CONTRIBUTIONS',
  rollingLabel: 'LAST 365 DAYS',
  calendarLabel: 'CONTRIBUTION CALENDAR',
  lessLabel: 'LESS',
  moreLabel: 'MORE',
  retryLabel: 'RETRY',
  unavailableLabel: 'CONTRIBUTION DATA UNAVAILABLE',
  loadingLabel: 'LOADING CONTRIBUTIONS',
};

export const ABOUT = {
  tag: { num: '05', en: 'ABOUT', cn: '关于我' },
  heading: {
    line1: '你好，我是 ',
    accent: 'riceawa',
    line2: '。',
    line3: '一个把好奇心',
    line4: '当燃料的开发者。',
  },
  paragraphs: [
    {
      prefix: '我专注于',
      highlights: ['前端开发', 'AI 应用'],
      suffix: '，喜欢探索 LLM 的边界，享受把创意变成现实的过程。在 Minecraft 社区里造过模组和 AI Agent，也在 B 站分享技术内容。',
    },
    {
      prefix: '相信技术的力量，也相信分享的价值 —— ',
      highlights: ['开源、写作、做工具'],
      suffix: '，是我与世界交换灵感的方式。',
    },
  ],
  avatar: {
    src: '/assets/avatar.jpg',
    alt: 'riceawa 头像',
    ringText: 'RICEAWA · CREATIVE DEV · OPEN SOURCE · ',
    caption: ['@RICE-AWA', 'EST. 2023'],
  },
  stats: [
    { value: 6, label: 'PROJECTS 项目' },
    { value: 12, label: 'TECH STACK 技术栈' },
    { value: 3, label: 'YEARS CODING 年限' },
    { value: -1, label: 'CURIOSITY 好奇心' },
  ],
};

export const CONTACT = {
  tag: { num: '06', en: 'CONTACT', cn: '联系我' },
  title: {
    row1: "LET'S BUILD",
    row2: 'SOMETHING →',
  },
  links: [
    { num: '01', name: 'GITHUB', note: '代码与开源项目', href: 'https://github.com/rice-awa' },
    { num: '02', name: 'BILIBILI', note: '技术分享与视频', href: 'https://space.bilibili.com/521856101' },
    { num: '03', name: 'BLOG', note: '文章与想法', href: 'https://blog.rice-awa.top' },
    { num: '04', name: 'EMAIL', note: 'hi@rice-awa.top — 通常 24h 内回复', href: 'mailto:hi@rice-awa.top' },
  ],
  footer: {
    status: 'OPEN FOR COLLABORATION',
    copyright: '© 2026 RICEAWA — DESIGNED & BUILT WITH ♥',
    backToTop: 'BACK TO TOP ↑',
  },
};
