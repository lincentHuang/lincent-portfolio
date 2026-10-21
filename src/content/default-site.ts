import type { SiteContent } from './types';

export const defaultSiteContent: SiteContent = {
  profile: {
    name: { zh: '黃令成', en: 'Lincent Huang' },
    title: { zh: '資深前端工程師', en: 'Senior Frontend Engineer' },
    tagline: {
      zh: '最喜歡把所有複雜的東西簡單系統化，並且賦予美感跟實用性。',
      en: 'I love turning complex things into simple systems, then giving them beauty and practicality.',
    },
    location: {
      zh: '台灣・新北市（雙北 / 可遠端）',
      en: 'New Taipei, Taiwan · Remote-friendly',
    },
    availability: { zh: '可於 2026/10/12 到職', en: 'Available from Oct 12, 2026' },
    email: 's890142s2009@gmail.com',
    phone: '',
    githubUrl: 'https://github.com/lincentt',
    linkedinUrl: 'https://www.linkedin.com/in/lincent-huang-6b318413b/',
    avatar: '/lincent-avatar.png',
    heroImage: '/images/hero-portrait.png',
    aboutCover: '',
  },

  seo: {
    title: {
      zh: '黃令成 Lincent | 資深前端工程師作品集',
      en: 'Lincent Huang | Senior Frontend Engineer Portfolio',
    },
    description: {
      zh: '黃令成（Lincent）的作品集：兼具設計底蘊與商業思維的資深前端工程師，專注 Monorepo 架構、Design System 與效能優化。',
      en: "Portfolio of Lincent Huang, a senior frontend engineer with a designer's eye and business sense, focused on monorepo architecture, design systems and performance.",
    },
    ogImage: '',
  },

  hero: {
    headlinePrefix: { zh: '把複雜的需求，', en: 'Turning complex needs' },
    headlineMain: { zh: '做成', en: 'into ' },
    headlineHighlight: { zh: '簡單好用的產品', en: 'simple, usable products' },
    subtitle: {
      zh: '前端工程師，也懂設計。從設計系統、Monorepo 架構到效能優化，幫團隊把想法做成好維護、好上手的網站與 App。',
      en: "A frontend engineer with a designer's eye. From design systems and monorepo architecture to performance tuning, I help teams turn ideas into websites and apps that are easy to maintain and easy to use.",
    },
    booking: {
      tag: { zh: '開放合作', en: 'Open to work' },
      title: { zh: '可承接全職與專案合作', en: 'Available for full-time & projects' },
      desc: { zh: '說說你的需求，24 小時內回覆。', en: "Tell me what you need — I'll reply within 24 hours." },
    },
    stats: [
      { value: '5+', label: { zh: '年工作經歷', en: 'Years of experience' } },
      { value: '20+', label: { zh: '網站與產品專案', en: 'Web & product projects' } },
      { value: '10+', label: { zh: '協助中小企業數位轉型', en: 'SMBs helped go digital' } },
    ],
  },

  benefits: {
    tag: { zh: '能幫你做的事', en: 'What I can help with' },
    title: { zh: '從設計到上線，一個人接得住', en: 'From design to launch, in one pair of hands' },
    subtitle: {
      zh: '懂設計也寫得了架構，少一層轉譯，做出來的東西就更接近原本想要的樣子。',
      en: "I design and I engineer, so there's one less hand-off — and what ships is closer to what you had in mind.",
    },
    cards: [
      {
        tag: { zh: '設計系統', en: 'Design system' },
        title: { zh: '讓設計和程式說同一種語言', en: 'Design and code that speak the same language' },
        desc: {
          zh: '用 Radix UI、Storybook 與設計 Token 建一套元件庫。設計改一次，每個畫面都跟著一致，不用每頁重刻。',
          en: 'A component library built on Radix UI, Storybook and design tokens. Change the design once and every screen stays consistent.',
        },
        chips: [],
      },
      {
        tag: { zh: '效能與 SEO', en: 'Performance & SEO' },
        title: { zh: '開得快，也找得到', en: 'Fast to load, easy to find' },
        desc: {
          zh: '調校 Core Web Vitals、圖片自動轉 WebP、SSR 與 SSG 混用，頁面秒開，搜尋引擎也看得懂。',
          en: 'Tuned Core Web Vitals, automatic WebP images and mixed SSR/SSG rendering — pages open instantly and search engines understand them.',
        },
        chips: [],
      },
      {
        tag: { zh: '工程架構', en: 'Architecture' },
        title: { zh: '專案變大，也不會亂', en: 'Structure that holds up as things grow' },
        desc: {
          zh: '用 Turborepo 管理 Monorepo、Jotai 管狀態、ts-morph 自動產生程式碼。人變多、功能變多，依然好維護。',
          en: 'Turborepo monorepos, Jotai for state and ts-morph code generation keep things maintainable as the team and features grow.',
        },
        chips: [
          'Next.js',
          'React',
          'TypeScript',
          'Turborepo',
          'Jotai',
          'Tailwind CSS',
          'React Native',
          'Storybook',
        ],
      },
    ],
  },

  whyChooseMe: {
    tag: { zh: '做過的成果', en: 'Results' },
    title: { zh: '做出來的，用數字說話', en: 'The numbers behind the work' },
    subtitle: { zh: '幾個上線專案留下來的具體成果。', en: 'Concrete outcomes from projects that shipped.' },
    stats: [
      {
        value: '80+',
        title: { zh: '可重用 UI 區塊', en: 'Reusable UI blocks' },
        desc: {
          zh: '在 Seaverse 把區塊拆成獨立套件，Web 與 App 共用同一套。',
          en: 'Split into standalone packages at Seaverse, shared by web and app.',
        },
      },
      {
        value: '4 + 9',
        title: { zh: 'App 與核心套件', en: 'Apps & core packages' },
        desc: {
          zh: '用 Turborepo 收進同一個 Monorepo，編譯時間大幅縮短。',
          en: 'Unified in one Turborepo monorepo, with much shorter build times.',
        },
      },
      {
        value: '99',
        title: { zh: 'Lighthouse 分數', en: 'Lighthouse score' },
        desc: {
          zh: 'kryptoGO 官網改版後，效能與 SEO 接近滿分。',
          en: "kryptoGO's redesigned site scored near-perfect on performance and SEO.",
        },
      },
      {
        value: '50,000+',
        title: { zh: '活動互動次數', en: 'Campaign interactions' },
        desc: { zh: 'Web3 心理測驗活動上線期間累積的參與。', en: 'Collected during the Web3 personality-quiz campaign.' },
      },
    ],
  },

  services: {
    tag: { zh: '專業服務範疇', en: 'Services' },
    title: { zh: '專注於高標準前端架構與體驗交付', en: 'Creative services for digital brands' },
    subtitle: {
      zh: '提供從需求分析、技術選型、設計系統落地到極致效能調優的全週期前端工程支持。',
      en: 'Focused design and development support to help brands build clearer identities, better websites, and refined product experiences.',
    },
    items: [
      {
        title: { zh: '前端架構與全端開發', en: 'Frontend Architecture & Dev' },
        desc: {
          zh: '打造高響應、高可擴展性的現代 Web 應用。結合 Next.js 14、React 18、TypeScript 與 Supabase 實現生產級交付。',
          en: 'Building responsive, polished web applications with clean structure, TypeScript type-safety, and production-ready execution.',
        },
        tags: ['Next.js 14', 'React 18', 'TypeScript', 'Monorepo'],
      },
      {
        title: { zh: '企業級 Design System', en: 'Enterprise Design Systems' },
        desc: {
          zh: '基於 Radix UI 與 Tailwind 打造無障礙組件庫與設計 Token，消除工程與設計溝通成本，提升團隊交付速率。',
          en: 'Creating clear visual token systems and headless a11y component libraries that keep your product consistent across every touchpoint.',
        },
        tags: ['Radix UI', 'Tailwind CSS', 'Storybook', 'Figma Tokens'],
      },
      {
        title: { zh: '極致效能調優與 DX 提升', en: 'Performance & DX Engineering' },
        desc: {
          zh: '專注 Core Web Vitals 秒開優化、圖片自動轉檔管線、Jotai 細粒度原子狀態治理與 AST 自動化程式碼生成。',
          en: 'Designing intuitive user flows, sub-second LCP optimization, fine-grained state management, and automated AST tooling.',
        },
        tags: ['Core Web Vitals', 'Jotai State', 'ts-morph AST', 'SEO'],
      },
    ],
  },

  process: {
    tag: { zh: '合作流程', en: 'How we work' },
    title: { zh: '六個步驟，從想法到上線', en: 'Six steps from idea to launch' },
    subtitle: {
      zh: '每一步都讓你知道做到哪、下一步是什麼，不會做到一半才發現方向不對。',
      en: "You always know where things stand and what's next — no surprises halfway through.",
    },
    steps: [
      {
        title: { zh: '釐清需求', en: 'Discovery' },
        desc: {
          zh: '先弄清楚要幫誰解決什麼問題、怎樣算成功，再談怎麼做。',
          en: "Start with who it's for, what problem it solves and what success looks like.",
        },
      },
      {
        title: { zh: '規劃架構', en: 'Strategy' },
        desc: {
          zh: '依規模選技術：要不要 Monorepo、狀態怎麼管、資料怎麼接、頁面怎麼渲染。',
          en: 'Choose the stack to fit the scale: monorepo or not, state, data and rendering.',
        },
      },
      {
        title: { zh: '定設計規範', en: 'Design system' },
        desc: {
          zh: '定好色彩、字級、間距與基礎元件，之後每一頁都照這套走。',
          en: 'Set colors, type, spacing and base components so every page follows the same rules.',
        },
      },
      {
        title: { zh: '開發與互動', en: 'Build' },
        desc: {
          zh: '型別寫好、響應式版面和細節互動一起做到位。',
          en: 'Typed components, responsive layouts and the small interactions, done together.',
        },
      },
      {
        title: { zh: '效能調校', en: 'Performance' },
        desc: {
          zh: '調 Core Web Vitals、壓圖片、拆載入，讓首屏 1 秒內出來。',
          en: 'Tune Core Web Vitals, compress images and split loading so the first screen shows within a second.',
        },
      },
      {
        title: { zh: '測試與交付', en: 'Delivery' },
        desc: {
          zh: '測試、自動部署、留好文件，交接後團隊也接得下去。',
          en: 'Tests, automated deploys and docs, so the team can carry on after hand-off.',
        },
      },
    ],
  },

  testimonials: {
    tag: { zh: '同行與團隊評價', en: 'Testimonials' },
    title: { zh: '值得信賴的工程交付評價', en: 'What teams say' },
    subtitle: {
      zh: '來自產品負責人、設計總監與技術團隊的真實協作反饋。',
      en: 'Thoughtful feedback from founders and teams who trusted the process, direction, and final result.',
    },
    items: [
      {
        quote: {
          zh: '與令成合作非常順暢。他對現代前端架構與 Design System 的掌握極為精準，讓團隊在短時間內突破了渲染與編譯效能瓶頸。',
          en: 'Working with Lincent was incredibly smooth. His mastery in modern architecture and Design Systems helped our team overcome complex state bottlenecks effortlessly.',
        },
        author: 'Ethan Brooks',
        role: { zh: 'Product Lead / 技術負責人', en: 'Product Lead' },
      },
      {
        quote: {
          zh: '開發流程高度結構化且組織嚴密。每一個技術決策都經過深思熟慮，最終交付的產品在效能與視覺細節上都無可挑剔。',
          en: 'The process was thoughtful, fast, and highly organized. Every engineering decision felt intentional, resulting in an exceptionally polished web application.',
        },
        author: 'Maya Chen',
        role: { zh: 'Design Director / 設計總監', en: 'Design Director' },
      },
      {
        quote: {
          zh: '他不僅能寫出高品質的程式碼，更能站在使用者體驗與商業價值的高度對齊產品。是少見兼具設計底蘊與架構深度的資深工程師。',
          en: 'He combines engineering rigor with aesthetic craft. A rare senior engineer who delivers both scalable code architecture and delightful UX.',
        },
        author: 'Marcus Vance',
        role: { zh: 'Founder & CEO', en: 'Founder & CEO' },
      },
    ],
  },

  experience: {
    tag: { zh: '經歷', en: 'Experience' },
    title: { zh: '這幾年做過的事', en: "Where I've worked" },
    subtitle: {
      zh: '從自己創業、幫傳產做數位轉型，到 Web3 與大型平台，一路從設計做到前端架構。',
      en: 'From running my own business and taking a manufacturer online to Web3 and large platforms — from design all the way to frontend architecture.',
    },
    items: [
      {
        id: 'exp-haiyu',
        company: {
          zh: '新加坡商海宇顧問服務有限公司台灣分公司',
          en: 'Haiyu Consulting Services Pte. Ltd., Taiwan Branch (Singapore)',
        },
        role: { zh: '前端工程師', en: 'Frontend Engineer' },
        period: '2023/10 — 2026/8',
        duration: { zh: '2 年 11 個月', en: '2 yrs 11 mos' },
        location: { zh: '台北市信義區', en: 'Xinyi District, Taipei' },
        badge: { zh: '核心架構主導', en: 'Core architecture lead' },
        summary: {
          zh: '主導跨裝置遊戲平台與大型 Monorepo 架構設計，突破渲染效能與編譯瓶頸，建立企業級 Design System 與自動化代碼生成體系。',
          en: 'Led the architecture of a cross-device gaming platform and a large monorepo, broke through rendering and build bottlenecks, and established an enterprise design system with automated code generation.',
        },
        highlights: [
          {
            zh: '導入 Turborepo + Yarn Workspaces，將 4 個 App 與 9 個核心包整合為 Monorepo，大幅縮短 CI/CD 編譯時間；抽離 80+ 個 UI 區塊為獨立 npm package，最大化跨端程式碼重用率。',
            en: 'Adopted Turborepo + Yarn Workspaces to unify 4 apps and 9 core packages into one monorepo, greatly cutting CI/CD build time; extracted 80+ UI blocks into independent npm packages to maximize cross-platform code reuse.',
          },
          {
            zh: '捨棄傳統全域狀態，改用 Jotai 進行細粒度反應性原子狀態管理，有效解決大量 DOM 節點變更時的渲染卡頓；實作 Optics-TS 光學變換，確保拖拽編輯器操作極致流暢。',
            en: 'Replaced traditional global state with Jotai for fine-grained atomic state management, resolving render jank when many DOM nodes change; applied Optics-TS to keep the drag-and-drop editor smooth.',
          },
          {
            zh: '基於 Radix UI 與 Storybook 建立高可訪問性企業級元件庫 (@spaceman/*)，消除 UI 實作誤差。',
            en: 'Built a highly accessible enterprise component library (@spaceman/*) on Radix UI and Storybook, eliminating UI implementation discrepancies.',
          },
          {
            zh: '運用 ts-morph 建置 AST 自動化代碼生成工具 (cms-codegen)，從 CMS 配置自動生成 TypeScript 型別與前端串接程式碼；導入 GitHub Copilot Configurations 加速重構效率。',
            en: 'Built an AST-based code generator (cms-codegen) with ts-morph that produces TypeScript types and frontend integration code from CMS configuration; introduced GitHub Copilot Configurations to speed up refactoring.',
          },
          {
            zh: '獨立開發自訂 WYSIWYG CMS 內容平台，賦能行銷企劃團隊獨立上稿，使新功能迭代週期顯著降低。',
            en: 'Independently developed a custom WYSIWYG CMS platform that lets marketing teams publish on their own, noticeably shortening feature iteration cycles.',
          },
        ],
        techTags: ['React', 'Next.js', 'React Native', 'Expo', 'Jotai', 'Turborepo', 'Optics-TS', 'ts-morph', 'Radix UI', 'Storybook', 'Tailwind CSS'],
      },
      {
        id: 'exp-kryptogo',
        company: { zh: '重量科技股份有限公司 (kryptoGO)', en: 'kryptoGO (Heavyweight Technology Co., Ltd.)' },
        role: { zh: '網頁設計師 / 前端工程師', en: 'Web Designer / Frontend Engineer' },
        period: '2022/6 — 2023/7',
        duration: { zh: '1 年 2 個月', en: '1 yr 2 mos' },
        location: { zh: '台北市信義區', en: 'Xinyi District, Taipei' },
        badge: { zh: 'Web3 官網與活動', en: 'Web3 site & campaigns' },
        summary: {
          zh: '隸屬行銷與前端核心團隊，負責官方網站、多國語系系統與活動頁面設計開發，電腦版 SEO 跑分近乎滿分。',
          en: 'Part of the marketing and frontend core team, responsible for the official website, multilingual system and campaign pages, achieving a near-perfect desktop SEO score.',
        },
        highlights: [
          {
            zh: '主導 kryptoGO 官方網站改版，整合 Next.js 13、Strapi CMS、i18n 多國語系與 Gsap 動畫，達成電腦版 SEO 近滿分成績。',
            en: 'Led the redesign of the kryptoGO official website, integrating Next.js 13, Strapi CMS, i18n and Gsap animation, reaching a near-perfect desktop SEO score.',
          },
          {
            zh: '企劃並開發「心理測驗 NFT 活動網站」與「KryptoGO x 91APP 活動頁面」，透過趣味心理測驗引導用戶領取專屬 NFT，帶動 Web3 業務社群裂變轉發。',
            en: 'Planned and built a psychology-quiz NFT campaign site and the KryptoGO x 91APP campaign page, where a fun quiz leads users to claim a personal NFT and drives social sharing for the Web3 business.',
          },
          {
            zh: '負責公司企業用簡報、活動主視覺 DM、UI/UX Figma 設計與 Lottie 動畫模組。',
            en: 'Handled corporate presentations, campaign key-visual DMs, UI/UX design in Figma and Lottie animation modules.',
          },
        ],
        techTags: ['Next.js 13', 'React 18', 'Strapi', 'Tailwind CSS', 'Styled-components', 'Gsap', 'Lottie', 'Figma', 'SEO'],
      },
      {
        id: 'exp-xinye',
        company: { zh: '心也國際有限公司', en: 'Xinye International Co., Ltd.' },
        role: { zh: 'UI/UX 設計師', en: 'UI/UX Designer' },
        period: '2022/2 — 2022/5',
        duration: { zh: '4 個月', en: '4 mos' },
        location: { zh: '台北市松山區', en: 'Songshan District, Taipei' },
        summary: {
          zh: '負責三個網站專案的 UI/UX 設計、改版、優化與維護，並協助行銷企劃與 SEO 流量優化。',
          en: 'Handled UI/UX design, redesign, optimization and maintenance for three website projects, and supported marketing planning and SEO traffic optimization.',
        },
        highlights: [
          {
            zh: '使用 Figma / XD 進行使用者介面設計與高保真 Prototype 製作。',
            en: 'Designed user interfaces and built high-fidelity prototypes with Figma and Adobe XD.',
          },
          {
            zh: '前端 HTML/CSS/JS 切版支援與 CRM 後台 (Shopify, Shopline, Wix) 營運維護。',
            en: 'Supported HTML/CSS/JS front-end slicing and maintained CRM back offices (Shopify, Shopline, Wix).',
          },
        ],
        techTags: ['Figma', 'Adobe XD', 'HTML5', 'CSS3', 'JavaScript', 'Shopify', 'SEO'],
      },
      {
        id: 'exp-ahaha',
        company: { zh: '阿哈哈市集實業', en: 'Ahaha Marketplace Enterprise' },
        role: { zh: '網站設計師、行銷企劃', en: 'Web Designer & Marketing Planner' },
        period: '2019/9 — 2021/11',
        duration: { zh: '2 年 3 個月', en: '2 yrs 3 mos' },
        location: { zh: '新北市八里區', en: 'Bali District, New Taipei' },
        summary: {
          zh: '協助超過 10 家中小企業進行網路數位轉型與網站開發，提供全方位 UI/UX 與品牌諮詢。',
          en: 'Helped more than 10 small and medium businesses go digital and build their websites, providing UI/UX design and brand consulting.',
        },
        highlights: [
          {
            zh: '企業官網規劃建置、UI/UX 設計、前端切版與 Webcenter 後台維護。',
            en: 'Planned and built corporate websites, covering UI/UX design, front-end slicing and Webcenter back-office maintenance.',
          },
          {
            zh: '年度檔期活動企劃、社群經營、SEO 優化與異業結盟談判。',
            en: 'Planned annual campaigns, managed social media, optimized SEO and negotiated cross-industry partnerships.',
          },
        ],
        techTags: ['UI/UX', 'HTML/CSS', 'JavaScript', 'Adobe XD', '整合行銷', 'SEO'],
      },
      {
        id: 'exp-weifeng',
        company: { zh: '惟峰工業股份有限公司', en: 'Weifeng Industrial Co., Ltd.' },
        role: { zh: '工程師 / 網站設計師', en: 'Engineer / Web Designer' },
        period: '2019/2 — 2022/11',
        duration: { zh: '3 年 10 個月', en: '3 yrs 10 mos' },
        location: { zh: '新北市五股區', en: 'Wugu District, New Taipei' },
        summary: {
          zh: '主導公司 5S 流程優化與企業官網翻轉，成功攻佔 Google 搜尋第一頁，業務開拓至海外市場。',
          en: "Led the company's 5S process optimization and a corporate website overhaul, reaching the first page of Google search and expanding business to overseas markets.",
        },
        highlights: [
          {
            zh: '創立並維護公司 5S SOP 流程優化，協助廠務高效率運轉。',
            en: 'Established and maintained the 5S SOP and process optimization to keep factory operations running efficiently.',
          },
          {
            zh: '獨立建置企業現代化官網，落實關鍵字優化，讓精密板金關鍵字躍居 Google 搜尋第一頁。',
            en: 'Independently built a modern corporate website and applied keyword optimization, bringing precision sheet-metal keywords to the first page of Google.',
          },
        ],
        techTags: ['HTML5', 'CSS3', 'JavaScript', 'AutoCAD', '流程優化', 'Google SEO'],
      },
      {
        id: 'exp-greenlid',
        company: { zh: '綠蓋子蔬果昔', en: 'Green Lid Smoothies' },
        role: { zh: '小老闆 / 創辦人', en: 'Owner / Founder' },
        period: '2018/3 — 2019/6',
        duration: { zh: '1 年 4 個月', en: '1 yr 4 mos' },
        location: { zh: '台北市北投區', en: 'Beitou District, Taipei' },
        summary: {
          zh: '青年創業經歷。從 0 到 1 打造蔬果昔品牌形象 LOGO、產品配方、定價與 FB 月訂閱制商業模式。',
          en: 'A young-entrepreneur venture: built a smoothie brand from zero to one, including logo, product recipes, pricing and a monthly subscription model on Facebook.',
        },
        highlights: [
          {
            zh: '設計讓人耳目一新的品牌 LOGO 與包裝形象，產品深受好評。',
            en: 'Designed a fresh brand logo and packaging identity that the product was praised for.',
          },
          {
            zh: '建構社群月訂閱制模式，產生穩定現金流與忠誠客戶回購。',
            en: 'Built a social-media monthly subscription model that generated steady cash flow and loyal repeat customers.',
          },
        ],
        techTags: ['品牌設計', '創業管理', '社群營運', '商業模式設計'],
      },
    ],
  },

  about: {
    headline: {
      zh: '兼具設計底蘊與商業思維的前端工程師',
      en: "A frontend engineer with a designer's eye and business sense",
    },
    motto: {
      zh: '將複雜系統極簡化，並賦予美感與實用性',
      en: 'Simplify complex systems, then give them beauty and practicality',
    },
    intro: {
      zh: '我擁有超過 5 年的數位產品開發與設計經驗，一路從 UI/UX 設計、品牌經營，跨足深耕前端工程架構。面對複雜的業務需求，我不只寫出高效能的程式碼，更從使用者體驗與商業轉換率的高度設計系統架構，為團隊交付具備實質商業價值的產品。',
      en: 'I have more than 5 years of experience in digital product development and design, moving from UI/UX design and brand building into frontend engineering architecture. Facing complex business needs, I write high-performance code and design system architecture from the perspective of user experience and conversion, delivering products with real business value.',
    },
    story: [
      {
        title: { zh: '關於我：兼具設計底蘊與商業思維的前端工程師', en: 'About me: a frontend engineer with design roots and business thinking' },
        body: {
          zh: '「將複雜系統極簡化，並賦予美感與實用性」是我的開發哲學。我擁有超過 5 年以上的數位產品開發與設計經驗，一路從 UI/UX 設計、品牌經營，跨足深耕前端工程架構。跨領域的背景讓我擁有獨特的優勢：在面對複雜的業務需求時，我不僅能寫出高效能的程式碼，更能從「使用者體驗」與「商業轉換率」的高度來設計系統架構，為團隊交付具備實質商業價值的產品。',
          en: 'My development philosophy is to simplify complex systems and give them beauty and practicality. With over 5 years in digital product development and design, I moved from UI/UX design and brand building into frontend architecture. This cross-disciplinary background is a unique strength: when facing complex business needs, I can write high-performance code and also design system architecture from the standpoint of user experience and conversion, delivering products with real business value.',
        },
      },
      {
        title: { zh: '技術深耕：專注架構優化與開發體驗', en: 'Technical depth: architecture optimization and developer experience' },
        body: {
          zh: '在最近於海宇顧問擔任前端工程師的期間，我負責主導跨裝置遊戲平台的開發與維護。面對龐大且複雜的專案，我致力於底層架構的優化，包含主導前端 Monorepo 架構與模組化管理，並重構 GitLab CI/CD 流程，確保自動化交付的穩定性。我也針對 React Native 的動畫引擎與 Web 端的 Next.js 進行深度效能調校，成功突破複雜介面的渲染瓶頸。面對技術的快速迭代，我主動將 AI 工程輔助工具（如自訂 GitHub Copilot Configurations）導入日常開發流程，不僅提升個人產出速度，更實質優化了團隊的開發者體驗 (DX) 與重構效率。',
          en: 'In my most recent role as a frontend engineer at Haiyu Consulting, I led the development and maintenance of a cross-device gaming platform. On a large, complex codebase I focused on foundational architecture: leading the frontend monorepo and modular package management, and refactoring GitLab CI/CD to keep automated delivery stable. I also deeply tuned the React Native animation engine and Next.js on the web, breaking through rendering bottlenecks in complex interfaces. Keeping pace with fast-moving technology, I introduced AI engineering tools such as custom GitHub Copilot Configurations into daily development, which sped up my own output and improved the team\'s developer experience (DX) and refactoring efficiency.',
        },
      },
      {
        title: { zh: '跨域協作：搭建設計與工程的高效橋樑', en: 'Cross-functional collaboration: bridging design and engineering' },
        body: {
          zh: '過往的產品設計師經歷，讓我成為工程與設計團隊間的最佳橋樑。為了解決跨部門溝通的痛點與 UI 實作誤差，我主導引入並基於 Radix UI 建立具備高可訪問性 (a11y) 的企業級 Design System 通用元件庫；同時導入 Storybook 作為單一真理源，讓設計規格與程式碼同步，大幅降低團隊的溝通成本與來回修改的時間。',
          en: 'My background as a product designer makes me a natural bridge between engineering and design teams. To resolve cross-team communication pain points and UI implementation gaps, I led the adoption of an accessible (a11y) enterprise design system component library built on Radix UI, and introduced Storybook as the single source of truth so design specs and code stay in sync, greatly reducing communication costs and rework.',
        },
      },
      {
        title: { zh: '商業敏銳度與未來期許', en: 'Business acumen and what comes next' },
        body: {
          zh: '除了技術深耕，過往的創業與接案經驗，培養了我對市場需求與專案時程的控管能力。我曾獨立開發 CMS 內容平台，賦能行銷企劃團隊自主營運，也曾為多間中小企業進行網站轉型與 SEO 優化。展望未來，我期望能加入具備挑戰性的團隊，持續在前端與全端領域發揮影響力，不只是執行功能的工程師，而是能積極引進前沿技術（如 AI 工具應用）、推動架構演進，並與團隊共同成長的關鍵技術推手。',
          en: 'Beyond technical depth, my entrepreneurial and freelance experience built my sense of market needs and project timelines. I independently built a CMS content platform that empowers marketing teams to run on their own, and helped several small and medium businesses transform their websites and optimize SEO. Looking ahead, I hope to join a challenging team and keep making an impact across frontend and full-stack, not just as an engineer who ships features, but as a key contributor who brings in cutting-edge technology such as AI tooling, drives architectural evolution and grows with the team.',
        },
      },
    ],
    principles: [
      {
        title: { zh: '極簡', en: 'Minimal' },
        desc: { zh: '把複雜的東西化繁為簡，只保留真正必要的部分。', en: 'Turn complexity into simplicity and keep only what truly matters.' },
      },
      {
        title: { zh: '創新', en: 'Innovative' },
        desc: { zh: '主動引進前沿技術與 AI 工具，持續推動架構演進。', en: 'Proactively adopt new technology and AI tools to keep architecture evolving.' },
      },
      {
        title: { zh: '圓融', en: 'Harmonious' },
        desc: { zh: '在設計、工程與商業之間溝通協調，讓團隊高效合作。', en: 'Coordinate across design, engineering and business so teams collaborate smoothly.' },
      },
      {
        title: { zh: '溫暖', en: 'Warm' },
        desc: { zh: '以同理心對待使用者與夥伴，讓產品與協作都有溫度。', en: 'Treat users and teammates with empathy so both products and collaboration feel human.' },
      },
      {
        title: { zh: '系統化', en: 'Systematic' },
        desc: { zh: '用 Design System 與 Monorepo 建立可重用、可維護的系統。', en: 'Build reusable, maintainable systems with design systems and monorepos.' },
      },
      {
        title: { zh: '數據驅動', en: 'Data-driven' },
        desc: { zh: '追求資料、數據與整齊，以可量測的指標做決策。', en: 'Favor data, metrics and tidiness, and make decisions on measurable indicators.' },
      },
    ],
    skills: [
      {
        category: { zh: '前端開發', en: 'Frontend Development' },
        items: ['React', 'Next.js', 'React Native', 'Expo', 'TypeScript', 'Tailwind CSS', 'Jotai', 'Framer Motion', 'Reanimated', 'styled-components', 'Sass'],
      },
      {
        category: { zh: 'UI/UX 設計', en: 'UI/UX Design' },
        items: ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Lottie'],
      },
      {
        category: { zh: '架構與工程化', en: 'Architecture & Engineering' },
        items: ['Turborepo', 'Monorepo', 'Storybook', 'Radix UI', 'ts-morph', 'GitLab CI/CD', 'GitHub Copilot'],
      },
      {
        category: { zh: '網站與行銷', en: 'Web & Marketing' },
        items: ['SEO', 'CMS / Strapi', 'i18n', 'HTML/CSS/JS'],
      },
      {
        category: { zh: '專案管理', en: 'Project Management' },
        items: ['Jira', 'Notion', 'Git'],
      },
    ],
    education: [
      {
        school: { zh: '南台科技大學', en: 'Southern Taiwan University of Science and Technology' },
        department: { zh: '創新產品設計系', en: 'Department of Innovative Product Design' },
        period: '2012/9 — 2016/6',
        highlights: {
          zh: '專長 UX/UI、產品設計與企劃思維；畢業專題針對環保議題，成果落地應用於新店老人公寓，成為系上必修範例專案。',
          en: 'Specialized in UX/UI, product design and planning. Graduation project on environmental issues was applied at an elderly apartment in Xindian and became a required example project for the department.',
        },
      },
      {
        school: { zh: '復興商工', en: 'Fuxing Vocational High School' },
        department: { zh: '美工科', en: 'Department of Commercial Art' },
        period: '2009/9 — 2012/6',
        highlights: {
          zh: '扎實的純美術、平面排版、色彩學與視覺構成訓練。',
          en: 'Solid training in fine art, layout design, color theory and visual composition.',
        },
      },
    ],
    languages: [
      { name: { zh: '中文', en: 'Chinese' }, level: { zh: '精通', en: 'Native / Fluent' } },
      { name: { zh: '英文', en: 'English' }, level: { zh: '中等（聽說讀中等、寫略懂）', en: 'Intermediate' } },
    ],
    preferences: [
      { label: { zh: '希望職稱', en: 'Desired title' }, value: { zh: '資深前端工程師', en: 'Senior Frontend Engineer' } },
      { label: { zh: '工作性質', en: 'Employment type' }, value: { zh: '全職', en: 'Full-time' } },
      { label: { zh: '地點', en: 'Location' }, value: { zh: '台北市・新北市（可遠端）', en: 'Taipei / New Taipei (remote-friendly)' } },
      { label: { zh: '可到職日', en: 'Available from' }, value: { zh: '2026/10/12', en: 'Oct 12, 2026' } },
    ],
  },

  sections: {
    benefits: true,
    projects: true,
    whyChooseMe: true,
    services: true,
    process: true,
    testimonials: false,
    experience: true,
    contact: true,
  },
};
