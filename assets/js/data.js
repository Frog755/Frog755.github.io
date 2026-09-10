/* Site content — 所有文案与项目数据集中在此，改内容只动这一个文件。 */

const SITE = {
  name: 'QINGWA',
  latin: 'FROG755 · PROJECT INDEX',
  mark: 'Q',
  tagline: '构建能自己干活的软件。',
  intro:
    '这里收录我持续打磨的 AI 项目：多智能体协同、代码自动化、内容生产流水线与数据监控。' +
    '所有条目都来自真实跑通的东西，不是概念稿。',
  contact: 'github.com/Frog755',
  contactUrl: 'https://github.com/Frog755',
  emails: [
    { label: 'QQ 邮箱', addr: 'frog75@qq.com' },
    { label: 'Gmail', addr: 'frog1960954886@gmail.com' }
  ],
  // 名称与公开联系方式（不含任何私人信息或本地路径）
  who: '青蛙',
  status: 'OPEN TO COLLABORATION',
  bio: '热衷于在数字世界中寻找逻辑与秩序的平衡点，致力于探索硬件、软件与交互设计的结合。',
  motto: '简约、严谨、高效',
  mottoText:
    '我深受瑞士设计（Swiss Design）观念的影响。无论是设计电路板、编写固件，还是构建网页，我都力求结构清晰、功能纯粹，' +
    '去掉所有无意义的冗余，用最干净的逻辑解决复杂的问题。'
};

/* 分类 */
const CATEGORIES = [
  { id: 'all', label: '全部', en: 'ALL' },
  { id: 'agents', label: '智能体与协同', en: 'AGENTS' },
  { id: 'devtools', label: '开发者工具', en: 'DEV TOOLS' },
  { id: 'content', label: '内容生产', en: 'CONTENT' },
  { id: 'data', label: '数据与监控', en: 'DATA' },
  { id: 'hardware', label: '嵌入式与硬件', en: 'HARDWARE' }
];

/* 项目 */
const PROJECTS = [
  {
    num: '01',
    id: 'agent-hub',
    title: 'Agent Hub',
    subtitle: '多智能体本地协同层',
    cat: 'agents',
    year: '2026',
    status: 'IN PROGRESS',
    featured: true,
    summary:
      '把 Hermes、DeepSeek Harness 与 pi 三个 Agent 接到同一套文件驱动的任务状态机上，跑通「手机发指令 → 代码落地」的闭环。',
    body: [
      'Agent Hub 是一个纯本地、以文件为唯一事实来源的协调层。它不依赖任何云服务，任务就是磁盘上的 JSON 文档，状态流转就是目录之间的移动。',
      '设计上刻意保持「笨」：任务有 active / paused / review / blocked / failed 几条明确路径，从手机端发来的暂停指令只做一件事——把任务挪到 paused 目录。没有魔法，出问题时打开文件夹就能看懂发生了什么。'
    ],
    points: [
      '闭环链路：微信/Telegram → Hermes → 任务收件箱 → pi 实现 → 独立评审 → 有界修复 → 回传',
      '准备式 / 提交式两段事务日志（prepared & committed journal），中断后可安全恢复',
      'headless pi runner：实现阶段与修复阶段分离，权威解析 worker 输出，支持只读模式',
      '任务文档内含评审历史与修复轮次，修复次数有上界，防止无限重试烧 token'
    ],
    stack: ['Node.js', 'JSON Schema', 'PowerShell', 'File-backed FSM'],
    links: []
  },
  {
    num: '02',
    id: 'browser-record',
    title: 'browser-record',
    subtitle: '录一遍操作，导出成 Agent Skill',
    cat: 'agents',
    year: '2026',
    status: 'ACTIVE',
    featured: true,
    summary:
      '人工在真实浏览器里演示一遍工作流，CLI 抓取每一步的选择器、截图与 DOM 上下文，打包成任何 Agent 都能读懂的标准技能包。',
    body: [
      '让 Agent 去自动化一个陌生网站时，大量轮次浪费在猜页面长什么样、元素叫什么、哪个选择器好用上。一次一分钟的人工演示就能把这些变成标准答案。',
      '产出的技能包遵循开放的 Agent Skills 标准（SKILL.md + recording.jsonl），Claude Code、Codex CLI、Cursor、Gemini CLI、DSH 等主流 Agent 都能直接放进技能目录使用。'
    ],
    points: [
      '多候选选择器：testid → id → aria-label → role+name → placeholder → text → css → xpath，按优先级排列',
      '每步留存截图与 DOM 上下文，出问题能定位到具体步骤',
      'browser-record verify 可无头回放录制，精确报告哪一步失败',
      '产物自包含、可移植，不绑定任何特定 Agent'
    ],
    stack: ['Node.js', 'Playwright', 'Agent Skills Spec'],
    links: []
  },
  {
    num: '03',
    id: 'douyin-bot',
    title: '抖音评论区 AI 机器人',
    subtitle: '会联网、有记忆的评论区智能体',
    cat: 'agents',
    year: '2026',
    status: 'V6.9',
    featured: true,
    summary:
      '基于 Playwright + LLM 的抖音网页版评论区自动回复。v6.9 从「只会对话」升级成真正的智能体：会联网查新梗、有全量评论记忆。',
    body: [
      '通过注入浏览器 cookie 保持登录态，自动读取视频评论，调用大模型生成回复，并模拟真人键盘输入逐字发送，规避简单的行为检测。',
      'v6.9 的关键变化是给了它三样东西：联网搜索能力（新梗、新事件不再装懂）、全量评论记忆（真的能查到「你之前说过什么」）、以及对自身成长的拟人化表述。'
    ],
    points: [
      'Playwright + playwright-stealth 反检测，模拟真人键入',
      '接入 Agnes 2.5 Flash：512K 上下文，支持 tool calling',
      'mcporter + exa 提供联网搜索后端，零配置免费使用',
      '全量评论记忆索引，支持跨评论上下文引用'
    ],
    stack: ['Python 3.12', 'Playwright', 'httpx', 'Agnes 2.5 Flash', 'MCP'],
    links: []
  },
  {
    num: '04',
    id: 'eval-set',
    title: '本地评测集',
    subtitle: '用真实任务度量可靠性',
    cat: 'agents',
    year: '2026',
    status: 'IN PROGRESS',
    summary:
      '不迷信外部实验数字（"Opus 比 Sonnet 强 19%"、"54.7% 重复读取"），攒够 20–30 个真实任务后，用数据决定先优化哪一环。',
    body: [
      '每完成一个真实任务（代码修改、浏览器登录上传、抖音发布、评论回复、失败重试、记忆命中、工具异常、多 Agent 编排……），就往 results.csv 追加一行。',
      '字段覆盖任务标识、日期、是否成功、重试次数、人工介入程度等。攒到足够样本后，就能判断 handoff、reviewer、memory、cleanup 哪一环最该先动刀。'
    ],
    points: [
      'CSV 结构化记录，字段含义与填写规范写进 README',
      '覆盖成功、失败重试、记忆命中、工具异常等多类事件',
      '以自身任务分布为准，拒绝照搬通用 benchmark 结论'
    ],
    stack: ['CSV', '统计分析'],
    links: []
  },
  {
    num: '05',
    id: 'code-review',
    title: 'AI 代码审查系统',
    subtitle: '多 Agent 协作 + 长链推理',
    cat: 'devtools',
    year: '2025',
    status: 'RELEASED',
    featured: true,
    summary:
      '代码分析 Agent、架构评估 Agent、测试生成 Agent 三个角色协同工作，自动审查代码质量、评估架构设计并生成测试用例。',
    body: [
      '三个专用 Agent 分别负责不同维度：一个读代码找缺陷与性能瓶颈，一个评估模块化和设计模式应用，一个补测试并评估覆盖率，最后由综合层收敛成可执行的改进建议。',
      '长链推理让系统能理解跨文件的上下文依赖关系，而不是孤立地看单个文件。'
    ],
    points: [
      '多 Agent 协作架构：分析 / 架构 / 测试三角色分工',
      '长链推理，识别跨文件依赖问题',
      '自动检测潜在 Bug、代码风格问题、性能瓶颈',
      '自动生成单元测试并评估覆盖率'
    ],
    stack: ['Node.js', 'TypeScript', 'Express'],
    links: [
      { label: '在线演示', url: 'https://frog755.github.io/ai-code-review-system-demo/' },
      { label: 'GitHub', url: 'https://github.com/Frog755/ai-code-review-system-demo/' }
    ]
  },
  {
    num: '06',
    id: 'awesome-dsh',
    title: 'Awesome DSH Plugin',
    subtitle: 'DeepSeek Harness 插件精选列表',
    cat: 'devtools',
    year: '2026',
    status: 'MAINTAINED',
    summary:
      '社区维护的 DeepSeek Harness 插件目录，收录所有可通过 dsh plugin add 安装的第三方插件，配中英双语 README 与自动化校验。',
    body: [
      'DeepSeek Harness 是 DeepSeek 开源的 agent harness，底层是「一切皆插件」的框架——模型、工具、沙箱、会话存储、UI，乃至 Agent Loop 本身都是插件。',
      '这个列表只收录声明了 dsh.bundle manifest、可正常安装的社区插件，并提供配套站点与自动计数徽章。'
    ],
    points: [
      '中英双语 README，同步维护',
      '配套站点 awesome-dsh-plugin.com，含 banner 与插件数动态徽章',
      '推荐 dsh-market：Harness 内置插件市场，一键安装升级与换主题'
    ],
    stack: ['Markdown', 'GitHub Actions', '静态站点'],
    links: [{ label: 'GitHub', url: 'https://github.com/Frog755/awesome-dsh-plugin' }]
  },
  {
    num: '07',
    id: 'dsh-sidebar',
    title: 'dsh-better-sidebar 增强',
    subtitle: '文件右键菜单改造',
    cat: 'devtools',
    year: '2026',
    status: 'SHIPPED',
    summary:
      '给 DSH 侧边栏插件补上真正好用的文件系统操作：文件行右键改为「在资源管理器中打开」并选中该文件，另加带二次确认的删除功能。',
    body: [
      '原生侧边栏对文件的右键菜单只有「下载」，实际使用时几乎没用。改动后：点文件夹打开文件夹本身，点文件则打开其所在目录并在资源管理器中选中该文件。',
      '早期版本靠给编译产物打补丁，后来上游源码可正常构建，已改为「改源码 → 构建 → 覆盖 lib/」的正规流程。'
    ],
    points: [
      '文件 / 文件夹统一为「在资源管理器中打开」，文件自动选中',
      '新增删除：二次确认弹窗，删除当前目录后自动回上一级',
      '从二进制补丁迁移到源码级修改，可随上游升级'
    ],
    stack: ['TypeScript', 'Node.js', 'Plugin Dev'],
    links: []
  },
  {
    num: '08',
    id: 'dsh-retry',
    title: 'dsh-client-auto-retry',
    subtitle: '429 限流自动续跑插件',
    cat: 'devtools',
    year: '2026',
    status: 'RELEASED',
    summary:
      'DSH 客户端遇到 429 限流时自动等待并继续，不用人守着重试。插件本体之外还配了一整套推广物料与自动化发布脚本。',
    body: [
      '插件逻辑可以概括成一个拟人化的小故事：AI 干活 = 转圈圈，结束时贴标签，插件像个小耳朵听着，三种情况下自动继续，懂分寸——重试 5 次就停手。',
      '仓库里同时维护掘金技术文章终稿、发布流程截图、演示素材，以及一套去 AI 味的改写工具链。'
    ],
    points: [
      '三类可续场景自动识别，重试上限 5 次防止死循环',
      'articles/ 存掘金已发布终稿与草稿版本',
      'scripts/ 自动化发布流程，assets/ 存演示截图',
      '集成 qu-ai-wei 去 AI 味工具做文案改写'
    ],
    stack: ['TypeScript', 'Node.js', 'Plugin Dev'],
    links: []
  },
  {
    num: '09',
    id: 'todo-cli',
    title: 'Todo CLI',
    subtitle: '命令行待办管理',
    cat: 'devtools',
    year: '2025',
    status: 'RELEASED',
    summary: '由 Claude 自主从零完成的命令行待办事项管理器，含完整任务管理与前端界面。',
    body: [
      '一次完整的自主开发实验：给出目标后由 Agent 完成从架构设计、源码实现到前端界面的全部工作，人只做验收。',
      '项目结构清晰分层：src/ 源码、bin/ 可执行文件、dist/ 编译输出、data/ 数据文件。'
    ],
    points: ['纯 CLI 交互，任务增删改查与状态管理', '附带前端界面', '由 AI Agent 自主完成开发'],
    stack: ['Node.js', 'CLI'],
    links: [{ label: 'GitHub', url: 'https://github.com/Frog755/todo-cli' }]
  },
  {
    num: '10',
    id: 'video-pipeline',
    title: 'AI 视频生产流水线',
    subtitle: 'HyperFrames × TTS × 逐句字幕',
    cat: 'content',
    year: '2026',
    status: 'SHIPPED',
    featured: true,
    summary:
      '一条可复用的「AI 产品介绍 / 教学视频」流水线：调研 → 实测 → 攒素材 → 写脚本 → TTS 旁白 → 渲染 → 逐句字幕 → 烧录 → 多平台发布。',
    body: [
      '核心三件套是踩了很多坑之后定下来的组合：hyperframes 用 HTML composition 渲染视频（GSAP 动画 + clip 时间轴），MiMo TTS 做旁白配音（冰糖音色，免费），再配逐句同步字幕。',
      '顺序不能乱：先有音频 → 时间轴由音频驱动 → 字幕按文本/音频比例对齐 → 最后烧录。反过来做必然对不齐。'
    ],
    points: [
      'HyperFrames：把 reveal.js / Slidev 的「点击驱动」换成「音频时间戳驱动」逐步 reveal',
      '每个 TTS 句子对应一个动画步骤，数字 / 标签 / 节点按口播逐一出场',
      'MiMo TTS 女声（冰糖音色）16 段口播，逐句生成 wav + manifest 时长',
      '真实界面截图演示，对照官方仓库逐条验证流程',
      '已产出作品：Agnes 全模态模型介绍片、TrendRadar 部署教学、Auto-Retry 原理讲解'
    ],
    stack: ['HyperFrames', 'GSAP', 'MiMo TTS', 'FFmpeg', 'Playwright'],
    links: []
  },
  {
    num: '11',
    id: 'mimo-tts',
    title: 'MiMo TTS 工具',
    subtitle: '三种模式的语音合成 CLI',
    cat: 'content',
    year: '2026',
    status: 'ACTIVE',
    summary: '封装小米 MiMo-V2.5 TTS 系列 API 的一键语音合成工具，预置音色 / 音色设计 / 音色复刻三模式。',
    body: [
      '预置音色模式开箱即用，冰糖、茉莉、苏打、白桦等精品音色直接选；音色设计模式用文字描述你想要的声音，无需样本；音色复刻提供参考音频即可精准克隆人声。',
      '整个视频流水线里的旁白全部由它产出。'
    ],
    points: [
      '预置音色：mimo-v2.5-tts',
      '文本设计音色：mimo-v2.5-tts-voicedesign',
      '音色克隆：mimo-v2.5-tts-voiceclone',
      'Windows 批处理封装，命令行一行出声'
    ],
    stack: ['Python', 'REST API', 'Audio'],
    links: []
  },
  {
    num: '12',
    id: 'fund-monitor',
    title: 'Fund Monitor',
    subtitle: '基金监控 + 微信提醒',
    cat: 'data',
    year: '2025',
    status: 'RELEASED',
    featured: true,
    summary:
      '把想看的基金加进去，跌到阈值、净值变动、分红、换经理，自动推送到微信。Windows 本地免费跑，或部署到 GitHub Actions，电脑不开机也能盯。',
    body: [
      '本地面板提供实时行情、阈值告警与推送配置，不需要盯盘。',
      '两种部署形态：本机常驻，或丢到 GitHub Actions 定时跑——后者关机也能推送，适合长期挂着的监控场景。'
    ],
    points: [
      '多类事件告警：跌幅阈值、净值变动、分红、基金经理变更',
      '企业微信 / 微信推送通道',
      '本地 Web 面板：实时行情 + 告警配置可视化',
      'GitHub Actions 云端部署，零成本长期运行'
    ],
    stack: ['Python', 'GitHub Actions', 'Web Dashboard'],
    links: [{ label: 'GitHub', url: 'https://github.com/Frog755/fund-monitor' }]
  },
  {
    num: '13',
    id: 'trendradar',
    title: 'TrendRadar 热点雷达',
    subtitle: '30 秒部署的热点聚合',
    cat: 'data',
    year: '2026',
    status: 'FORK',
    summary:
      'Fork 自 sansan0/TrendRadar，聚合多平台热榜并推送到微信，另附 Cherry Studio 零基础部署指南与 MCP 问答文档。',
    body: [
      '原项目主打「最快 30 秒部署，告别无效刷屏」。我的 fork 上跑通了 71 次 GitHub Actions 定时抓取，并补齐了面向零编程基础用户的部署教学。',
      '同时维护 MCP 工具使用问答：如何用自然语言查热点话题、按日期范围回溯历史新闻。'
    ],
    points: [
      'GitHub Actions 定时抓取，实测已跑通 71 次',
      '企业微信 / 微信推送',
      'MCP Server 支持：自然语言查询热榜与历史新闻',
      '附 Cherry Studio 图形客户端部署指南（面向非程序员）'
    ],
    stack: ['Python', 'GitHub Actions', 'MCP'],
    links: [{ label: 'GitHub', url: 'https://github.com/Frog755/TrendRadar' }]
  },
  {
    num: '14',
    id: 'keep-data-sim',
    title: 'Keep Data Simulator',
    subtitle: '运动轨迹数据生成',
    cat: 'data',
    year: '2026',
    status: 'FORK',
    summary:
      'Python CLI 工具，模拟跑步 / 骑行活动，生成带 GPS 轨迹、心率、海拔、步频的数据文件，导出 GPX 或 FIT。',
    body: [
      '适合测试运动 App、数据导入流程、轨迹展示与运动指标分析，或者需要构造可复现运动记录的场景。',
      '路线类型支持环形、往返、途经点、导入 GPX、导入坐标文件、手绘地图导出；配速策略支持匀速、后半程加速等。'
    ],
    points: [
      '运动类型：running / cycling',
      '导出格式：GPX、FIT',
      '六种路线生成方式，含手绘地图 JSON 导入',
      '多种配速策略，可生成负分段数据'
    ],
    stack: ['Python', 'GPX', 'FIT'],
    links: []
  },
  {
    num: '15',
    id: 'model-compare',
    title: '模型对比基准',
    subtitle: '延迟与质量实测套件',
    cat: 'data',
    year: '2026',
    status: 'ACTIVE',
    summary: '一套自用的模型对比脚本集：跑基准、测延迟、重打分、出报告，用于选型而不是发排行榜。',
    body: [
      '包含 bench-suite、latency-probe、compare、regrade 等脚本，覆盖从请求延迟探测到输出质量重评的完整链路。',
      '目的是回答具体问题——「这个任务用哪个模型性价比最高」——而不是产出一个漂亮的排行榜。'
    ],
    points: ['延迟探测 latency-probe', '批量基准 bench-suite / run-bench', '结果重评 regrade', '自动生成 report.md'],
    stack: ['Node.js', 'Benchmark'],
    links: []
  },
  {
    num: '16',
    id: 'crazy-circuit',
    title: 'crazy_circuit',
    subtitle: 'AURIX 双核智能车嵌入式工程',
    cat: 'hardware',
    year: '2025',
    status: 'RELEASED',
    featured: true,
    summary:
      '基于 Infineon AURIX（TriCore）的嵌入式 C 工程：陀螺仪、编码器、图像处理、电机 PID、蓝牙与双核调度全部自己写。',
    body: [
      '从零搭建的智能车控制工程，Tasking 工具链，双核（cpu0 / cpu1）分工，中断服务与外设驱动手写。',
      '模块划分清晰：传感器采集（陀螺仪、编码器）、图像预处理、PID 闭环控制、电机驱动、蓝牙调试、按键与人机菜单。'
    ],
    points: [
      'Infineon AURIX TC 系列 TriCore 架构，Tasking 编译器 + LSL 链接脚本',
      '双核主程序：cpu0_main / cpu1_main 分离任务，isr.c 集中管理中断',
      '传感器：Gyro（陀螺仪）+ Encoder（编码器）数据融合',
      '控制：pid.c 闭环，motor.c 驱动输出',
      '调试链路：my_BT 蓝牙透传 + menu/key 人机交互'
    ],
    stack: ['C', 'Infineon AURIX TriCore', 'Tasking', 'PID Control', 'Embedded'],
    links: [{ label: 'GitHub', url: 'https://github.com/Frog755/crazy_circuit' }]
  }
];

/* 笔记 / 文章 */
const NOTES = [
  {
    num: '01',
    date: '2026-08',
    title: 'DeepSeek Harness 429 自动重试插件原理',
    kind: '技术文章',
    desc: '已发布于掘金的终稿。把插件逻辑讲成一个拟人故事：转圈圈、贴标签、小耳朵、懂分寸重试 5 次停手。',
    tag: 'DSH'
  },
  {
    num: '02',
    date: '2026-08',
    title: 'TrendRadar × GitHub Actions 部署教学',
    kind: '视频 + 文档',
    desc: '面向零编程基础用户，真实界面截图逐步演示 Use this template → Secrets → Run workflow，配 MiMo 女声口播。',
    tag: '教程'
  },
  {
    num: '03',
    date: '2026-09',
    title: 'Agent Hub 设计文档',
    kind: '设计文档',
    desc: '约 38KB 的完整设计说明：协议、任务状态机、事务日志、runner 与评审环路的全部细节。',
    tag: '架构'
  },
  {
    num: '04',
    date: '2026-08',
    title: '去 AI 味：技术文章改写工作流',
    kind: '方法论',
    desc: '集成 qu-ai-wei 工具链，把 Agent 生成的初稿改写成读起来像人写的中文技术文章。',
    tag: '写作'
  },
  {
    num: '05',
    date: '2026-08',
    title: '本地评测集：用真实任务度量 Agent 可靠性',
    kind: '方法论',
    desc: '拒绝照搬外部 benchmark 数字，改为记录自己每天真实任务的成败与重试，用数据决定优化优先级。',
    tag: '评测'
  }
];

/* 关于页 */
const ABOUT = {
  paragraphs: [
    SITE.bio,
    '我做 AI 工程的方式有点偏实践派：先让东西真的跑起来，再回头补抽象。这个索引站收录的都是实际跑通的项目，不是规划中的想法。',
    '最近的主要精力放在多智能体协同上——怎么让几个不同性格的 Agent 在同一套状态机上可靠地交接工作，而不是各干各的。'
  ],
  stackGroups: [
    { label: 'HARDWARE', items: ['C / C++', 'STM32 MCU', 'Infineon AURIX TC', 'Altium Designer', 'PID 控制'] },
    { label: 'LANGUAGES', items: ['TypeScript / JavaScript', 'Python', 'PowerShell', 'Bash'] },
    { label: 'AI / AGENTS', items: ['DeepSeek Harness', 'Claude Code', 'Agnes 2.5', 'MCP', 'Agent Skills'] },
    { label: 'AUTOMATION', items: ['Playwright', 'GitHub Actions', 'HyperFrames', 'MiMo TTS'] }
  ],
  facts: [
    { k: 'Who', v: SITE.who + ' / FROG755' },
    { k: 'Focus', v: 'AI Agents · Automation · Embedded' },
    { k: '收录项目', v: String(PROJECTS.length) },
    { k: 'Email', v: SITE.emails[0].addr }
  ]
};
