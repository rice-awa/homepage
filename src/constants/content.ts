export const SITE = {
  title: 'riceawa — Creative Developer',
  description: 'riceawa 的个人作品集，收录 Minecraft 模组、AI 应用与 Web 开发项目。',
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
    prefix: '我开发 ',
    highlights: ['Minecraft 模组', 'AI Agent'],
    suffix: '，也做 Web 应用和实用工具。',
  },
  coord: 'PORTFOLIO © 2023—2026 / FULL-STACK × CREATIVE',
  socials: [
    { label: 'GITHUB ↗', href: 'https://github.com/rice-awa' },
    { label: 'BILIBILI ↗', href: 'https://space.bilibili.com/521856101' },
    { label: 'BLOG ↗', href: 'https://blog.rice-awa.top' },
  ],
};

export const MANIFESTO = {
  tag: { num: '01', en: 'MANIFESTO', cn: '开发与分享' },
  lines: [
    { en: ['WRITE ', 'CODE', ','], accentIdx: 1, cn: '用代码实现自己的想法' },
    { en: ['CRAFT ', 'WORLDS', ','], accentIdx: 1, cn: '开发 Minecraft 模组与工具' },
    { en: ['SHARE ', 'WONDER', '.'], accentIdx: 1, cn: '开源项目，记录开发过程' },
  ],
  foot: {
    prefix: '我做过 ',
    highlights: ['Minecraft 模组', '大语言模型应用'],
    suffix: '。项目通常源于自己的使用需求，我会把实现过程和遇到的问题整理成文章或视频。',
  },
};

export const WORKS = {
  tag: { num: '02', en: 'SELECTED WORKS', cn: '精选作品' },
  title: {
    line1: '我开发的',
    line2: '一些项目',
  },
  desc: '这里收录了游戏模组、AI 应用和 Web 工具，也记录了我在不同技术上的尝试。',
  items: [
    {
      id: 'mcbe-ai-agent',
      num: '01',
      name: 'MCBE AI Agent',
      year: '2026',
      tags: ['PYTHON', 'PYDANTICAI', 'WEBSOCKET', 'MCP'],
      desc: '面向 Minecraft 基岩版的 AI Agent，支持多种大语言模型和流式回复，通过异步消息队列处理请求，并隔离多人会话。',
      link: 'https://github.com/rice-awa/MCBE-AI-Agent',
      image: '/assets/mcbe-ai-agent-hero.webp',
    },
    {
      id: 'lumichat',
      num: '02',
      name: 'LumiChat',
      year: '2026',
      tags: ['JAVA', 'FABRIC', 'LLM', 'TOOL-CALL'],
      desc: 'Minecraft Fabric 模组，支持在游戏中与大语言模型对话，包含 13 个游戏内工具，支持提示词模板热编辑与多个模型服务的健康检查。',
      link: 'https://github.com/rice-awa/LumiChat',
      image: '/assets/lumichat-hero.webp',
    },
    {
      id: 'ffmpeg-web',
      num: '03',
      name: 'FFmpeg Web Tool',
      year: '2025',
      tags: ['JAVASCRIPT', 'WEBASSEMBLY', 'FFMPEG'],
      desc: '基于 FFmpeg 与 WebAssembly 的音视频工具，可在浏览器本地完成转码、压缩和裁剪，无需上传文件。',
      link: 'https://github.com/rice-awa',
      coverGen: { line1: 'FFMPEG', line2: 'WEB', cg: 'rgba(34,211,238,.30)', cgStrong: '#22d3ee', meta: ['WEBASSEMBLY / IN-BROWSER', 'MEDIA TOOL / 2025'] },
    },
    {
      id: 'essay-grader',
      num: '04',
      name: 'AI Essay Grader',
      year: '2024',
      tags: ['PYTHON', 'FLASK', 'LANGCHAIN'],
      desc: '英语作文辅助批改工具，使用 AI 生成多维度评分和逐句修改建议，供写作练习与教学参考。',
      link: 'https://github.com/rice-awa/AutoGradAI',
      coverGen: { line1: 'ESSAY', line2: 'GRADER', cg: 'rgba(96,165,250,.30)', cgStrong: '#60a5fa', meta: ['FLASK / LANGCHAIN', 'AI EDUCATION / 2024'] },
    },
    {
      id: 'rice-awa-top',
      num: '05',
      name: 'rice-awa.top',
      year: '2024',
      tags: ['NEXT.JS', 'TYPESCRIPT', 'TAILWIND'],
      desc: '个人主页与工具集合，包含主题切换、项目介绍和实用小工具，也用于尝试新的前端技术。',
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
  pauseLabel: '暂停滚动',
  resumeLabel: '继续滚动',
  agents: {
    title: 'AI AGENT TOOLS',
    description: '使用过的 AI Agent 工具',
    items: ['Claude Code', 'Codex', 'DeepSeek Harness', 'Hermes Agent', 'Cursor'],
  },
  marquee1: ['REACT', 'NEXT.JS', 'TYPESCRIPT', 'TAILWIND CSS', 'GSAP', 'MOTION', 'CANVAS'],
  marquee2: ['PYTHON', 'NODE.JS', 'FLASK', 'DOCKER', 'LINUX', 'GIT', 'LLM / AGENT'],
  foot: [
    { label: '前端：', text: '使用 React、Next.js 和 TypeScript 开发界面，用 Tailwind CSS 与 GSAP 处理样式和交互。' },
    { label: '后端 & 工具：', text: '使用 Python、Node.js 和 Flask 编写服务，通过 Docker 与 Linux 部署，使用 Git 管理代码。' },
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
    line3: '主要做前端',
    line4: '与 AI 应用开发。',
  },
  paragraphs: [
    {
      prefix: '我专注于',
      highlights: ['前端开发', 'AI 应用'],
      suffix: '，开发过 Minecraft 模组和游戏内 AI Agent，也在 B 站分享项目与技术内容。',
    },
    {
      prefix: '开发之外，我也会花时间',
      highlights: ['维护开源项目、整理技术笔记'],
      suffix: '。记录实现思路和遇到的问题，方便自己回顾，也供有相同需求的人参考。',
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
    { num: '04', name: 'EMAIL', note: 'hi@rice-awa.top', href: 'mailto:hi@rice-awa.top' },
  ],
  footer: {
    status: 'OPEN FOR COLLABORATION',
    copyright: '© 2026 RICEAWA — DESIGNED & BUILT WITH ♥',
    backToTop: 'BACK TO TOP ↑',
  },
};
