/* ============================================================
   SWISS STYLE × QINGWA // FROG755
   View Routing · Dual-Channel Oscilloscope & Audio Synth · 
   Particle Mesh with Light/Dark Multiply Blending ·
   Typewriter Loop · Note Reader Drawer · Command Palette · CLI Simulation
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const VIEWS = [
  { id: 'index', num: '00', label: 'INDEX', title: '索引', sub: '总览与核心指标' },
  { id: 'projects', num: '01', label: 'PROJECTS', title: '项目', sub: '工程与流水线' },
  { id: 'notes', num: '02', label: 'NOTES', title: '笔记', sub: '文章与方法论' },
  { id: 'about', num: '03', label: 'ABOUT', title: '关于', sub: '系统档案与工具栈' }
];

const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || id;
const isDark = () => document.documentElement.dataset.theme === 'dark';
const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff66';

/* ---------------- 全局状态 ---------------- */
let currentView = 'index';
let currentCat = 'all';
let searchQuery = '';
let viewMode = localStorage.getItem('frog-view-mode') || 'list'; // 'list' | 'bento'
let soundEnabled = localStorage.getItem('frog-sound') === '1';
let currentProjectIndex = -1;
let currentNoteIndex = -1;
let cmdItems = [];
let cmdSelectedIndex = 0;

/* ---------------- 微音效与示波器声音发生器 (Web Audio API) ---------------- */
let audioCtx = null;
let synthOsc = null;
let synthGain = null;
let isScopeAudioPlaying = false;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(freq = 750, type = 'sine', duration = 0.04) {
  if (!soundEnabled) return;
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function toggleScopeAudio() {
  initAudioContext();
  if (isScopeAudioPlaying) {
    stopScopeAudio();
    showToast('示波器音频信号: 已静音');
  } else {
    startScopeAudio();
    showToast('示波器音频信号: 实时监听中 (移动鼠标调频)');
  }
}

function startScopeAudio() {
  try {
    initAudioContext();
    if (synthOsc) stopScopeAudio();
    synthOsc = audioCtx.createOscillator();
    synthGain = audioCtx.createGain();
    synthOsc.type = scopeMode === 'pulse' ? 'square' : 'sine';
    synthOsc.frequency.setValueAtTime(440, audioCtx.currentTime);
    synthGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    synthOsc.connect(synthGain);
    synthGain.connect(audioCtx.destination);
    synthOsc.start();
    isScopeAudioPlaying = true;
    const btn = $('#scopeAudioBtn');
    if (btn) btn.classList.add('is-active');
  } catch (e) {}
}

function stopScopeAudio() {
  if (synthOsc) {
    try {
      synthGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      synthOsc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
    synthOsc = null;
    synthGain = null;
  }
  isScopeAudioPlaying = false;
  const btn = $('#scopeAudioBtn');
  if (btn) btn.classList.remove('is-active');
}

function updateScopeAudioFreq(freq) {
  if (isScopeAudioPlaying && synthOsc && audioCtx) {
    try {
      synthOsc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.02);
      if (scopeMode === 'pulse') synthOsc.type = 'square';
      else if (scopeMode === 'harmonic') synthOsc.type = 'sawtooth';
      else synthOsc.type = 'sine';
    } catch (e) {}
  }
}

/* ---------------- Toast 气泡通知 ---------------- */
let toastTimer = null;
function showToast(msg, duration = 2200) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('is-show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-show'), duration);
}

function copyText(text, successMsg = '已复制到剪贴板') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      playSound(900, 'sine', 0.05);
      showToast(successMsg);
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    playSound(900, 'sine', 0.05);
    showToast(successMsg);
  } catch (e) {
    showToast('复制失败，请手动选择');
  }
  document.body.removeChild(ta);
}

/* ---------------- 渲染 Tabs ---------------- */
function renderTabs() {
  $('#tabs').innerHTML = VIEWS.map(
    (v) => `<button class="tab" role="tab" data-view="${v.id}"><span style="opacity:0.6;margin-right:4px">${v.num}</span>${v.label}</button>`
  ).join('');
}

/* ---------------- 00 INDEX 渲染 ---------------- */
function renderIndex() {
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 3);
  const totalP = PROJECTS.length;
  const agentP = PROJECTS.filter((p) => p.cat === 'agents').length;
  const notesCount = NOTES.length;

  $('#view-index').innerHTML = `
    <section class="hero">
      <div class="wrap">
        <div class="crosshair crosshair-tl mono">+ // 0.00</div>
        <div class="crosshair crosshair-tr mono">+ // 12.0</div>

        <div class="telemetry mono">
          <span class="status-dot"></span>
          <span class="active">SYSTEM STATUS: ALL NOMINAL</span>
          <span>//</span>
          <span>LOCATION: SHANGHAI · CN</span>
          <span>//</span>
          <span>CORE RUNTIME: NODE.JS 22 / PY 3.12 / TRICORE</span>
        </div>

        <div class="hero-grid">
          <div class="hero-title-box">
            <h1 class="hero-title">
              BUILDING<br>SOFTWARE THAT<br>
              <em id="heroTypewriter">WORKS ITSELF.</em><span class="typewriter-cursor"></span>
            </h1>
            <p class="hero-subtag">${esc(SITE.intro)}</p>
          </div>

          <aside class="identity" id="identityCard">
            <div class="identity-top mono">
              <span class="identity-badge"><span class="status-dot"></span>${esc(SITE.status)}</span>
              <span>OPERATOR #755</span>
            </div>
            <div>
              <h2>HI, I'M ${esc(SITE.who)}.</h2>
              <p>${esc(SITE.bio)}</p>
            </div>
            <div class="identity-foot">
              <span class="mono" style="font-size:10px;color:var(--sub)">${esc(SITE.contact)}</span>
              <button class="copy-badge-btn mono" id="copyIntroBtn" title="复制联系方式">
                <span>COPY INFO</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      <!-- 数字存储示波器 (DSO) -->
      <div class="scope-wrap">
        <div class="scope-hud mono">
          <span class="scope-hud-ch1" id="scopeCh1Tag">CH1: 500mV/DIV · SINE</span>
          <span class="scope-hud-ch2">CH2: 1.00V/DIV · HARMONIC</span>
          <span class="scope-hud-measure" id="scopeMeasureTag">FREQ: 1.25 kHz · Vpp: 3.30V</span>
          <span id="scopeStatusTag">TRIG: AUTO [SCANNING]</span>
        </div>
        <canvas id="oscilloscope" class="scope-canvas"></canvas>
        <div class="scope-controls">
          <button class="scope-action-btn" id="scopeAudioBtn" title="开启声音调制合成器">AUDIO 🔈</button>
          <button class="scope-action-btn" id="scopeFreezeBtn" title="冻结采样 / 继续运行">FREEZE ⏸</button>
          <span style="color:rgba(255,255,255,0.2)">|</span>
          <button class="scope-mode-btn is-active" data-smode="sine">SINE</button>
          <button class="scope-mode-btn" data-smode="pulse">PULSE</button>
          <button class="scope-mode-btn" data-smode="lissajous">LISSAJOUS</button>
          <button class="scope-mode-btn" data-smode="harmonic">COMPLEX</button>
        </div>
      </div>

      <!-- 核心指标统计 -->
      <div class="wrap">
        <div class="hero-foot">
          <div class="stat-box">
            <div class="stat-k mono"><span>PROJECTS</span><span>01</span></div>
            <div class="stat-v">${String(totalP).padStart(2, '0')}</div>
            <div class="stat-desc">收录验证项目，覆盖全闭环</div>
          </div>
          <div class="stat-box">
            <div class="stat-k mono"><span>AGENTS</span><span>02</span></div>
            <div class="stat-v">${String(agentP).padStart(2, '0')}</div>
            <div class="stat-desc">多智能体协同、状态机与执行体</div>
          </div>
          <div class="stat-box">
            <div class="stat-k mono"><span>NOTES</span><span>03</span></div>
            <div class="stat-v">${String(notesCount).padStart(2, '0')}</div>
            <div class="stat-desc">架构推演、部署教学与写作</div>
          </div>
          <div class="stat-box">
            <div class="stat-k mono"><span>AUDIT</span><span>04</span></div>
            <div class="stat-v">100%</div>
            <div class="stat-desc">无外部云依赖 · 本地可复现</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 入口选择 -->
    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Entries // 核心入口</h2>
          <span class="section-meta mono">键盘 [1]–[4] 快速跳转</span>
        </div>
        <div class="entries">
          ${VIEWS.map(
            (v) => `
            <button class="entry" data-goto="${v.id}">
              <div class="entry-top">
                <span class="entry-num">${v.num}</span>
                <span class="entry-shortcut mono">[${parseInt(v.num, 10) + 1}]</span>
              </div>
              <div>
                <h3 class="entry-title">${esc(v.title)}</h3>
                <span class="entry-sub">${esc(v.sub)}</span>
              </div>
              <div class="entry-arrow mono">
                <span>EXPLORE</span>
                <span>↗</span>
              </div>
            </button>`
          ).join('')}
        </div>
      </section>

      <!-- 精选项目 -->
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Selected Work // 精选工程</h2>
          <button class="section-meta mono" data-goto="projects" style="cursor:pointer;color:var(--accent)">查看全部 ${totalP} 个项目 →</button>
        </div>
        <div class="featured">
          ${featured
            .map(
              (p) => `
            <article class="fcard" data-project="${p.id}">
              <div class="fcard-top mono">
                <span>${p.num} // ${esc(catLabel(p.cat))}</span>
                <span class="status" data-s="${esc(p.status)}">${esc(p.status)}</span>
              </div>
              <h3 class="fcard-title">${esc(p.title)}</h3>
              <p class="fcard-sub">${esc(p.subtitle)}</p>
              <p class="fcard-desc">${esc(p.summary)}</p>
              <div class="fcard-tags">
                ${p.stack.slice(0, 3).map((s) => `<span class="mini-tag">${esc(s)}</span>`).join('')}
              </div>
            </article>`
            )
            .join('')}
        </div>
      </section>
    </div>`;

  initScope();
  attachSpotlight();
  startTypewriter();
}

/* ---------------- 打字机轮播标语 ---------------- */
let typewriterIndex = 0;
let typewriterTimer = null;

function startTypewriter() {
  const el = $('#heroTypewriter');
  if (!el) return;
  if (typewriterTimer) clearInterval(typewriterTimer);

  let curText = HERO_PUNCHLINES[0];
  let isDeleting = false;
  let charIdx = curText.length;

  function typeStep() {
    const fullText = HERO_PUNCHLINES[typewriterIndex % HERO_PUNCHLINES.length];

    if (isDeleting) {
      charIdx--;
      el.textContent = fullText.substring(0, charIdx);
      if (charIdx <= 0) {
        isDeleting = false;
        typewriterIndex++;
        setTimeout(typeStep, 350);
        return;
      }
      setTimeout(typeStep, 45);
    } else {
      charIdx++;
      el.textContent = fullText.substring(0, charIdx);
      if (charIdx >= fullText.length) {
        isDeleting = true;
        setTimeout(typeStep, 3200); // 停顿供阅读
        return;
      }
      setTimeout(typeStep, 80);
    }
  }

  typewriterTimer = setTimeout(typeStep, 2600);
}

/* ---------------- 01 PROJECTS 渲染 ---------------- */
function renderProjects() {
  $('#view-projects').innerHTML = `
    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Projects // 项目索引</h2>
          <span class="section-meta mono" id="pj-count"></span>
        </div>

        <div class="projects-toolbar">
          <div class="search-bar-row">
            <div class="search-bar">
              <span class="search-icon">⌕</span>
              <input type="text" class="search-input" id="searchInput" placeholder="实时搜索项目名称、描述或技术栈 (如 Playwright, Python, C, Agent)..." autocomplete="off" spellcheck="false" value="${esc(searchQuery)}">
              <button class="search-clear" id="searchClear" title="清空搜索">✕</button>
            </div>
            <button class="random-btn" id="randomProjectBtn" title="随机抽取一个项目探索">
              <span>🎲 随机探索</span>
            </button>
          </div>

          <div class="filter-row">
            <div class="filters" id="filters">
              ${CATEGORIES.map((c) => {
                const count = c.id === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.cat === c.id).length;
                return `<button class="chip${c.id === currentCat ? ' is-active' : ''}" data-cat="${c.id}">
                  <span>${esc(c.label)}</span>
                  <span class="chip-count">${count}</span>
                </button>`;
              }).join('')}
            </div>

            <div class="view-mode-toggle">
              <button class="view-btn${viewMode === 'list' ? ' is-active' : ''}" data-vmode="list" title="列表视图">☰ LIST</button>
              <button class="view-btn${viewMode === 'bento' ? ' is-active' : ''}" data-vmode="bento" title="便当盒卡片视图">☷ BENTO</button>
            </div>
          </div>
        </div>

        <div id="projectsContainer"></div>
      </section>
    </div>`;

  paintProjects();

  const input = $('#searchInput');
  const clearBtn = $('#searchClear');
  if (input) {
    input.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
      paintProjects();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchQuery = '';
      if (input) { input.value = ''; input.focus(); }
      clearBtn.style.display = 'none';
      paintProjects();
    });
  }

  const randBtn = $('#randomProjectBtn');
  if (randBtn) {
    randBtn.onclick = () => {
      const p = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
      playSound(820, 'sine', 0.04);
      openProject(p.id);
      showToast(`🎲 随机抽中: ${p.title}`);
    };
  }
}

function filterProjects() {
  return PROJECTS.filter((p) => {
    const matchCat = currentCat === 'all' || p.cat === currentCat;
    if (!matchCat) return false;
    if (!searchQuery) return true;
    const hay = `${p.num} ${p.title} ${p.subtitle} ${p.summary} ${p.body.join(' ')} ${p.points.join(' ')} ${p.stack.join(' ')}`.toLowerCase();
    return hay.includes(searchQuery);
  });
}

function paintProjects() {
  const list = filterProjects();
  const container = $('#projectsContainer');
  const countEl = $('#pj-count');
  if (countEl) countEl.textContent = `DISPLAYING ${String(list.length).padStart(2, '0')} / ${PROJECTS.length}`;

  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size:32px;margin-bottom:12px;opacity:0.5">⌕</div>
        <h3>未找到匹配的项目</h3>
        <p>尝试搜索其他关键词，或清空筛选条件。</p>
        <button class="chip" style="margin-top:14px" onclick="clearAllFilters()">重置所有筛选</button>
      </div>`;
    return;
  }

  if (viewMode === 'list') {
    container.innerHTML = `
      <div class="plist">
        ${list
          .map(
            (p) => `
          <div class="prow" data-project="${p.id}">
            <div class="prow-num">${p.num}</div>
            <div>
              <h3 class="prow-title">${esc(p.title)}</h3>
              <span class="prow-sub">${esc(p.subtitle)}</span>
            </div>
            <p class="prow-desc">${esc(p.summary)}</p>
            <span class="prow-cat">${esc(catLabel(p.cat))}</span>
            <span><span class="status" data-s="${esc(p.status)}">${esc(p.status)}</span></span>
            <span class="prow-arrow">→</span>
          </div>`
          )
          .join('')}
      </div>`;
  } else {
    container.innerHTML = `
      <div class="pbento">
        ${list
          .map(
            (p) => `
          <div class="bento-card" data-project="${p.id}">
            <div>
              <div class="bento-top">
                <span class="bento-cat mono">${p.num} // ${esc(catLabel(p.cat))}</span>
                <span class="status" data-s="${esc(p.status)}">${esc(p.status)}</span>
              </div>
              <h3 class="bento-title">${esc(p.title)}</h3>
              <p class="bento-sub">${esc(p.subtitle)}</p>
              <p class="bento-desc">${esc(p.summary)}</p>
            </div>
            <div class="bento-foot">
              <div class="fcard-tags">
                ${p.stack.slice(0, 3).map((s) => `<span class="mini-tag">${esc(s)}</span>`).join('')}
              </div>
              <span class="mono" style="font-size:10px;color:var(--accent);display:inline-flex;align-items:center;gap:4px">
                OPEN <span>↗</span>
              </span>
            </div>
          </div>`
          )
          .join('')}
      </div>`;
  }
  attachSpotlight();
}

window.clearAllFilters = function () {
  searchQuery = '';
  currentCat = 'all';
  renderProjects();
};

/* ---------------- 02 NOTES 渲染 ---------------- */
function renderNotes() {
  $('#view-notes').innerHTML = `
    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Notes &amp; Writings // 思考与方法论</h2>
          <span class="section-meta mono">共 ${String(NOTES.length).padStart(2, '0')} 篇 · 点击阅读详述</span>
        </div>
        <div class="notes-container">
          ${NOTES.map(
            (n) => `
            <article class="note" data-note-id="${n.id}">
              <div class="note-date">${esc(n.date)}</div>
              <div>
                <h3 class="note-title">${esc(n.title)}</h3>
                <p class="note-desc">${esc(n.desc)}</p>
              </div>
              <div class="note-meta">
                <span class="note-tag">${esc(n.tag)}</span>
                <span class="note-read">${esc(n.readTime || '5 MIN READ')}</span>
              </div>
            </article>`
          ).join('')}
        </div>
      </section>
    </div>`;
  attachSpotlight();
}

/* ---------------- 打开笔记阅读抽屉 ---------------- */
function openNote(id) {
  const idx = NOTES.findIndex((x) => x.id === id);
  if (idx === -1) return;
  currentNoteIndex = idx;
  const n = NOTES[idx];

  const hasPrev = idx > 0;
  const hasNext = idx < NOTES.length - 1;

  $('#sheet-body').innerHTML = `
    <div class="sheet-nav">
      <div class="sheet-nav-left mono">
        <span>NOTE ${n.num} // ${esc(n.tag)} // ${esc(n.date)}</span>
      </div>
      <div class="sheet-nav-actions">
        <button class="sheet-btn mono" id="notePrevBtn" ${hasPrev ? '' : 'disabled style="opacity:0.4;cursor:not-allowed"'}>
          ← 上一篇
        </button>
        <button class="sheet-btn mono" id="noteNextBtn" ${hasNext ? '' : 'disabled style="opacity:0.4;cursor:not-allowed"'}>
          下一篇 →
        </button>
        <button class="sheet-btn mono" id="noteCopyLinkBtn" title="复制链接">
          分享 ↗
        </button>
        <button class="sheet-close-btn" data-close title="关闭 (ESC)">✕</button>
      </div>
    </div>

    <span class="note-tag mono">${esc(n.tag)} · ${esc(n.kind)} · ${esc(n.readTime)}</span>
    <h2 class="sheet-title">${esc(n.title)}</h2>
    <p class="sheet-sub">${esc(n.desc)}</p>

    <div class="sheet-sec">
      <h5>BACKGROUND // 核心背景与动机</h5>
      ${(n.body || []).map((t) => `<p>${esc(t)}</p>`).join('')}
    </div>

    <div class="sheet-sec">
      <h5>KEY TAKEAWAYS // 关键要点拆解</h5>
      <ul>${(n.highlights || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>

    ${
      n.code
        ? `<div class="sheet-sec">
            <h5>CODE / WORKFLOW SNIPPET // 核心代码与拓扑</h5>
            <pre class="sheet-code"><code>${esc(n.code)}</code></pre>
          </div>`
        : ''
    }`;

  $('#sheet').classList.add('is-open');
  document.body.style.overflow = 'hidden';
  location.hash = `note/${n.id}`;

  $('#notePrevBtn').onclick = () => hasPrev && openNote(NOTES[idx - 1].id);
  $('#noteNextBtn').onclick = () => hasNext && openNote(NOTES[idx + 1].id);
  $('#noteCopyLinkBtn').onclick = () => copyText(window.location.href, `已复制文章链接: ${n.title}`);
}

/* ---------------- 03 ABOUT 渲染 ---------------- */
function renderAbout() {
  $('#view-about').innerHTML = `
    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">About // 系统档案</h2>
          <span class="section-meta mono"><span class="status-dot"></span>${esc(SITE.who)}</span>
        </div>

        <div class="about-grid">
          <div class="about-lead">
            ${ABOUT.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
          <div class="about-facts">
            ${ABOUT.facts
              .map(
                (f) => `<div class="fact"><span class="fact-k">${esc(f.k)}</span><span class="fact-v">${esc(f.v)}</span></div>`
              )
              .join('')}
          </div>

          <!-- 命令行终端卡片 -->
          <div class="cli-widget">
            <div class="cli-head">
              <div class="cli-head-left">
                <span class="cli-dot red"></span>
                <span class="cli-dot yellow"></span>
                <span class="cli-dot green"></span>
                <span class="cli-title">frog755@terminal — node_inspection</span>
              </div>
              <span class="mono" style="font-size:10px;opacity:0.5">SSH: ACTIVE</span>
            </div>
            <div><span class="cli-prompt">$</span> <span id="cliInputText">frog755 --system-status</span></div>
            <div class="cli-out" id="cliOutBox">
              ${(ABOUT.cli || [])
                .map((item) => `[<span class="cli-highlight">${esc(item.k)}</span>] -> ${esc(item.v)}`)
                .join('<br>')}
            </div>
            <div class="cli-shortcuts mono">
              <span style="opacity:0.5;align-self:center">QUICK EXEC:</span>
              <button class="cli-cmd-chip" data-cmd="skills">$ --skills</button>
              <button class="cli-cmd-chip" data-cmd="projects">$ --projects</button>
              <button class="cli-cmd-chip" data-cmd="contact">$ --contact</button>
              <button class="cli-cmd-chip" data-cmd="clear">$ clear</button>
            </div>
          </div>
        </div>

        <!-- 理念卡片 -->
        <div class="motto">
          <span class="motto-label mono">DESIGN PHILOSOPHY // 瑞士设计主张</span>
          <h3>${esc(SITE.motto.split('、')[0])}、${esc(SITE.motto.split('、')[1])}、<em>${esc(SITE.motto.split('、')[2] || '')}</em></h3>
          <p>${esc(SITE.mottoText)}</p>
        </div>
      </section>

      <!-- 工具栈 -->
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Toolkit // 工具与技术栈</h2>
          <span class="section-meta mono">点击技术栈直接检索项目</span>
        </div>
        <div class="stack-grid">
          ${ABOUT.stackGroups
            .map(
              (g) => `
            <div class="stack-col">
              <h4>${esc(g.label)}</h4>
              <ul>
                ${g.items.map((i) => `<li data-search-tech="${esc(i)}">${esc(i)}</li>`).join('')}
              </ul>
            </div>`
            )
            .join('')}
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Get In Touch // 建立联络</h2>
          <span class="section-meta mono">${esc(SITE.contact)}</span>
        </div>
        <div class="contact-grid">
          <div class="contact-row" data-copy="${esc(SITE.emails[0].addr)}">
            <span class="contact-k">${esc(SITE.emails[0].label)}</span>
            <span class="contact-v">${esc(SITE.emails[0].addr)}</span>
            <span class="contact-go mono" title="点击复制">COPY ↗</span>
          </div>
          <div class="contact-row" data-copy="${esc(SITE.emails[1].addr)}">
            <span class="contact-k">${esc(SITE.emails[1].label)}</span>
            <span class="contact-v">${esc(SITE.emails[1].addr)}</span>
            <span class="contact-go mono" title="点击复制">COPY ↗</span>
          </div>
          <a class="contact-row" href="${esc(SITE.contactUrl)}" target="_blank" rel="noopener">
            <span class="contact-k">GitHub</span>
            <span class="contact-v">${esc(SITE.contact)}</span>
            <span class="contact-go mono">VISIT ↗</span>
          </a>
        </div>
      </section>
    </div>`;

  attachSpotlight();
  attachCliInteractions();
}

function attachCliInteractions() {
  $$('.cli-cmd-chip').forEach((btn) => {
    btn.onclick = () => {
      const cmd = btn.dataset.cmd;
      const inputEl = $('#cliInputText');
      const outBox = $('#cliOutBox');
      if (!inputEl || !outBox) return;
      playSound(780, 'sine', 0.025);

      if (cmd === 'clear') {
        inputEl.textContent = 'clear';
        outBox.innerHTML = '[TERMINAL CLEARED] — READY ■';
        return;
      }

      if (cmd === 'skills') {
        inputEl.textContent = 'frog755 --skills';
        outBox.innerHTML = `[<span class="cli-highlight">STACK</span>] -> C/C++, TypeScript, Python, PowerShell, Rust<br>[<span class="cli-highlight">EMBEDDED</span>] -> STM32, Infineon AURIX TC264, PID Controller, CAN/UART<br>[<span class="cli-highlight">AGENT_STACK</span>] -> DeepSeek Harness, Playwright, MCP, Agent Skills, Claude Code`;
      } else if (cmd === 'projects') {
        inputEl.textContent = 'frog755 --projects --summary';
        outBox.innerHTML = `[<span class="cli-highlight">TOTAL</span>] -> 16 Repositories Loaded<br>[<span class="cli-accent">HIGHLIGHT_01</span>] -> Agent Hub (Multi-Agent FSM)<br>[<span class="cli-accent">HIGHLIGHT_02</span>] -> browser-record (CLI Recording -> Agent Skills)<br>[<span class="cli-accent">HIGHLIGHT_03</span>] -> crazy_circuit (Dual-Core TriCore Car Embedded C)`;
      } else if (cmd === 'contact') {
        inputEl.textContent = 'frog755 --contact';
        outBox.innerHTML = `[<span class="cli-highlight">EMAIL_QQ</span>] -> frog75@qq.com<br>[<span class="cli-highlight">EMAIL_GMAIL</span>] -> frog1960954886@gmail.com<br>[<span class="cli-highlight">GITHUB</span>] -> https://github.com/Frog755`;
      }
    };
  });
}

/* ---------------- 项目详情抽屉 ---------------- */
function openProject(id) {
  const idx = PROJECTS.findIndex((x) => x.id === id);
  if (idx === -1) return;
  currentProjectIndex = idx;
  const p = PROJECTS[idx];

  const hasPrev = idx > 0;
  const hasNext = idx < PROJECTS.length - 1;

  $('#sheet-body').innerHTML = `
    <div class="sheet-nav">
      <div class="sheet-nav-left mono">
        <span>${p.num} / ${esc(catLabel(p.cat))} / ${esc(p.year)}</span>
      </div>
      <div class="sheet-nav-actions">
        <button class="sheet-btn mono" id="sheetPrevBtn" ${hasPrev ? '' : 'disabled style="opacity:0.4;cursor:not-allowed"'}>
          ← 上一个
        </button>
        <button class="sheet-btn mono" id="sheetNextBtn" ${hasNext ? '' : 'disabled style="opacity:0.4;cursor:not-allowed"'}>
          下一个 →
        </button>
        <button class="sheet-btn mono" id="sheetCopyLinkBtn" title="复制深度分享链接">
          分享 ↗
        </button>
        <button class="sheet-close-btn" data-close title="关闭 (ESC)">✕</button>
      </div>
    </div>

    <span class="status" data-s="${esc(p.status)}">${esc(p.status)}</span>
    <h2 class="sheet-title">${esc(p.title)}</h2>
    <p class="sheet-sub">${esc(p.subtitle)}</p>
    <div class="sheet-sum">${esc(p.summary)}</div>

    <div class="sheet-sec">
      <h5>OVERVIEW // 架构与设计</h5>
      ${p.body.map((t) => `<p>${esc(t)}</p>`).join('')}
    </div>

    <div class="sheet-sec">
      <h5>KEY HIGHLIGHTS // 核心突破点</h5>
      <ul>${p.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>

    <div class="sheet-sec">
      <h5>TECH STACK // 依赖与栈</h5>
      <div class="tags">${p.stack.map((s) => `<span class="tag mono">${esc(s)}</span>`).join('')}</div>
    </div>

    ${
      p.links && p.links.length
        ? `<div class="sheet-sec">
            <h5>RESOURCES // 交付物与链接</h5>
            <div class="sheet-links">${p.links
              .map((l) => `<a href="${esc(l.url)}" ${l.url.startsWith('#') ? '' : 'target="_blank" rel="noopener"'}>${esc(l.label)} ↗</a>`)
              .join('')}</div>
          </div>`
        : ''
    }`;

  $('#sheet').classList.add('is-open');
  document.body.style.overflow = 'hidden';
  location.hash = `project/${p.id}`;

  $('#sheetPrevBtn').onclick = () => hasPrev && openProject(PROJECTS[idx - 1].id);
  $('#sheetNextBtn').onclick = () => hasNext && openProject(PROJECTS[idx + 1].id);
  $('#sheetCopyLinkBtn').onclick = () => copyText(window.location.href, `已复制项目链接: ${p.title}`);
}

function closeSheet() {
  $('#sheet').classList.remove('is-open');
  document.body.style.overflow = '';
  currentProjectIndex = -1;
  currentNoteIndex = -1;
  if (location.hash.startsWith('#project/') || location.hash.startsWith('#note/')) {
    location.hash = currentView;
  }
}

/* ---------------- 视图路由切换 ---------------- */
function go(id, updateHash = true) {
  const v = VIEWS.find((x) => x.id === id) || VIEWS[0];
  currentView = v.id;
  $$('.view').forEach((el) => el.classList.toggle('is-active', el.id === 'view-' + v.id));
  $$('.tab').forEach((el) => el.classList.toggle('is-active', el.dataset.view === v.id));
  if (updateHash && location.hash.slice(1) !== v.id && !location.hash.startsWith('#project/') && !location.hash.startsWith('#note/')) {
    location.hash = v.id;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (v.id === 'index') {
    requestAnimationFrame(resizeScope);
    startTypewriter();
  }
  playSound(650, 'sine', 0.025);
}

/* ---------------- 主题切换 ---------------- */
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('blog-theme', t); } catch (e) {}
  playSound(850, 'sine', 0.03);
  if (window.updateParticleTheme) window.updateParticleTheme();
}

/* ---------------- Spotlight 光标流光效果 ---------------- */
function attachSpotlight() {
  const targets = $$('.entry, .fcard, .bento-card, .stat-box');
  targets.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ---------------- 数字存储示波器 (DIGITAL STORAGE OSCILLOSCOPE) ---------------- */
let scopeCtx = null, scopePhase = 0, scopeRaf = null;
let scopeMode = 'sine';
let isScopeFrozen = false;

function resizeScope() {
  const c = $('#oscilloscope');
  if (!c) return;
  const r = c.parentElement.getBoundingClientRect();
  c.width = Math.max(1, Math.floor(r.width));
  c.height = Math.max(1, Math.floor(r.height));
}

function initScope() {
  const canvas = $('#oscilloscope');
  if (!canvas) return;
  scopeCtx = canvas.getContext('2d');
  resizeScope();
  if (scopeRaf) cancelAnimationFrame(scopeRaf);

  const block = canvas.parentElement;
  block.addEventListener('mousemove', (e) => {
    const r = block.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    scopePhase += ratio * 0.08;
    const freq = 220 + ratio * 660;
    updateScopeAudioFreq(freq);

    const measureEl = $('#scopeMeasureTag');
    if (measureEl) {
      measureEl.textContent = `FREQ: ${(freq / 1000).toFixed(2)} kHz · Vpp: ${(3.0 + ratio * 0.8).toFixed(2)}V`;
    }
  });

  $$('.scope-mode-btn').forEach((btn) => {
    btn.onclick = () => {
      $$('.scope-mode-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      scopeMode = btn.dataset.smode;
      const ch1Tag = $('#scopeCh1Tag');
      if (ch1Tag) ch1Tag.textContent = `CH1: 500mV/DIV · ${scopeMode.toUpperCase()}`;
      playSound(720, 'square', 0.03);
    };
  });

  const freezeBtn = $('#scopeFreezeBtn');
  if (freezeBtn) {
    freezeBtn.onclick = () => {
      isScopeFrozen = !isScopeFrozen;
      freezeBtn.classList.toggle('is-active', isScopeFrozen);
      freezeBtn.textContent = isScopeFrozen ? 'RUN ▶' : 'FREEZE ⏸';
      const statTag = $('#scopeStatusTag');
      if (statTag) {
        statTag.textContent = isScopeFrozen ? 'TRIG: HOLD [FROZEN]' : 'TRIG: AUTO [SCANNING]';
        statTag.style.color = isScopeFrozen ? '#ff5f56' : '';
      }
      playSound(600, 'sine', 0.03);
    };
  }

  const audioBtn = $('#scopeAudioBtn');
  if (audioBtn) {
    audioBtn.onclick = () => toggleScopeAudio();
  }

  drawScope();
}

function drawScope() {
  const c = $('#oscilloscope');
  if (!c || !scopeCtx) return;
  const ctx = scopeCtx;
  const w = c.width, h = c.height, mid = h / 2;
  ctx.clearRect(0, 0, w, h);

  // 1. 示波器标尺背景网格 (Graticule)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  const gridX = 40, gridY = 24;
  for (let x = 0; x < w; x += gridX) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridY) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  // 中心十字轴线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
  ctx.restore();

  // 2. CH2 参考谐波 / 次级波形 (Cyan)
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 1.2;
  for (let x = 0; x < w; x += 2) {
    const amp = Math.sin((x / w) * Math.PI) * (h * 0.18);
    const y = mid + Math.sin(x * 0.03 - scopePhase * 0.6) * amp;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 3. CH1 主波形 (Frog Neon Green)
  const color = '#00ff66';
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;

  for (let x = 0; x < w; x++) {
    const envelope = Math.sin((x / w) * Math.PI);
    let y = mid;

    if (scopeMode === 'sine') {
      const amp = envelope * (h * 0.32);
      y = mid + Math.sin(x * 0.018 + scopePhase) * amp;
    } else if (scopeMode === 'pulse') {
      const amp = envelope * (h * 0.3);
      const raw = Math.sin(x * 0.015 + scopePhase);
      y = mid + (raw > 0 ? 1 : -1) * amp * 0.7;
    } else if (scopeMode === 'lissajous') {
      const amp = envelope * (h * 0.34);
      y = mid + Math.sin(x * 0.02 + scopePhase) * Math.cos(x * 0.01 - scopePhase) * amp;
    } else if (scopeMode === 'harmonic') {
      const amp = envelope * (h * 0.28);
      y = mid + (Math.sin(x * 0.015 + scopePhase) + 0.4 * Math.sin(x * 0.045 - scopePhase * 1.5)) * amp;
    }

    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (!isScopeFrozen) {
    scopePhase += 0.022;
  }
  scopeRaf = requestAnimationFrame(drawScope);
}

/* ---------------- 粒子涟漪背景 (Three.js WebGL，带纯 Canvas 优雅降级) ---------------- */
function initParticles() {
  if (typeof THREE === 'undefined') {
    initCanvasFallbackParticles();
    return;
  }

  const canvas = $('#particle-canvas');
  if (!canvas) return;

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.PlaneGeometry(80, 55, 200, 140);
    const vertexShader = `
      uniform float uTime;
      uniform vec3 uMouse;
      uniform float uIsDark;
      varying float vDist;
      varying float vElevation;
      varying float vWave;

      void main() {
        float d = distance(position.xy, uMouse.xy);
        vDist = d;
        
        // 1. 全屏呼吸微波起伏
        float baseWave = sin(position.x * 0.15 + uTime * 1.2) * cos(position.y * 0.15 + uTime * 1.2) * 0.2;
        
        // 2. 鼠标动态水波纹：振幅充盈，多层同心涟漪
        float waveFactor = smoothstep(22.0, 0.0, d);
        float mouseWave = sin(d * 1.25 - uTime * 6.5) * 1.3 * waveFactor;
        
        vec3 p = position;
        p.z += baseWave + mouseWave;
        vElevation = p.z;
        vWave = mouseWave;
        
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        
        // 3. 粒子尺寸控制：
        // 浅色模式下：波峰处的深黑点显著放大至 8px~14px，远处保持 2.5px~3.5px 清晰工程网格点
        float sizeScale;
        if (uIsDark > 0.5) {
          sizeScale = waveFactor * 2.5 + 0.9;
        } else {
          float crestFactor = max(0.0, sin(d * 1.25 - uTime * 6.5));
          sizeScale = (waveFactor * 3.4 * (0.5 + 0.5 * crestFactor)) + 1.2;
        }
        
        gl_PointSize = (22.0 / -mv.z) * sizeScale;
      }`;

    const fragmentShader = `
      uniform float uIsDark;
      varying float vDist;
      varying float vElevation;
      varying float vWave;

      void main() {
        // 严格抗锯齿圆形裁切
        vec2 pt = gl_PointCoord - vec2(0.5);
        float distSq = dot(pt, pt);
        if (distSq > 0.25) discard;
        
        float circleEdge = 1.0 - smoothstep(0.16, 0.25, distSq);
        float waveFactor = smoothstep(22.0, 0.0, vDist);
        
        if (uIsDark > 0.5) {
          // --- 暗色主题：荧光绿赛博终端光圈 ---
          vec3 baseCol = vec3(0.0, 0.35, 0.15); // 暗绿基底
          vec3 peakCol = vec3(0.0, 1.0, 0.4);   // 高亮荧光绿
          vec3 col = mix(baseCol, peakCol, waveFactor * 0.85 + 0.15);
          float alpha = mix(0.12, 0.95, waveFactor) * circleEdge;
          gl_FragColor = vec4(col, alpha);
        } else {
          // --- 浅色主题：高对比度纯深黑 / 水墨重彩波点涟漪 ---
          // 远离鼠标处：深邃清晰的石墨深灰色 (#242930)
          // 鼠标动态划过的涟漪中心与同心波峰：极致纯深黑 (#000000)
          vec3 baseCol = vec3(0.15, 0.18, 0.22); // 远处全屏微网格点：清晰深石墨色
          vec3 rippleCol = vec3(0.0, 0.0, 0.0);   // 动态涟漪处：绝对纯深黑色！
          
          float crest = smoothstep(-0.6, 0.8, vWave);
          vec3 col = mix(baseCol, rippleCol, waveFactor);
          
          // 远离处 alpha 保持在 0.28 (高清晰度工程纸底点阵)
          // 涟漪波峰处 alpha 飙升至 0.98 (极深纯黑高对比水波)
          float alpha = mix(0.28, 0.98, waveFactor * (0.6 + 0.4 * crest)) * circleEdge;
          gl_FragColor = vec4(col, alpha);
        }
      }`;

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uIsDark: { value: isDark() ? 1.0 : 0.0 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: isDark() ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    scene.add(new THREE.Points(geometry, material));

    window.updateParticleTheme = () => {
      const dark = isDark();
      uniforms.uIsDark.value = dark ? 1.0 : 0.0;
      material.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      material.needsUpdate = true;
    };

    const mouse = new THREE.Vector2(0, 0);
    const target = new THREE.Vector3(0, 0, 0);
    const current = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const setMouse = (x, y) => {
      mouse.x = (x / window.innerWidth) * 2 - 1;
      mouse.y = -(y / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', (e) => setMouse(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => { if (e.touches[0]) setMouse(e.touches[0].clientX, e.touches[0].clientY); });
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      resizeScope();
    });

    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      if (document.body.classList.contains('no-particles')) return;
      uniforms.uTime.value = clock.getElapsedTime();
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, target);
      current.lerp(target, 0.06);
      uniforms.uMouse.value.copy(current);
      renderer.render(scene, camera);
    })();
  } catch (err) {
    console.warn('WebGL Three.js initialization failed, falling back to 2D Canvas particles:', err);
    initCanvasFallbackParticles();
  }
}

function initCanvasFallbackParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2 + 1
  }));

  (function loop() {
    requestAnimationFrame(loop);
    if (document.body.classList.contains('no-particles')) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isDark() ? '#00ff66' : '#040608';
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  })();
}

/* ---------------- Command Palette (全局搜索与快捷命令) ---------------- */
function buildCmdItems() {
  const items = [];
  // 1. 视图跳转
  VIEWS.forEach((v) => {
    items.push({
      type: 'VIEW',
      title: `${v.num} ${v.title} (${v.label})`,
      meta: v.sub,
      action: () => go(v.id)
    });
  });
  // 2. 所有项目
  PROJECTS.forEach((p) => {
    items.push({
      type: 'PROJECT',
      title: `${p.num} ${p.title}`,
      meta: `${catLabel(p.cat)} · ${p.subtitle}`,
      action: () => {
        go('projects', false);
        openProject(p.id);
      }
    });
  });
  // 3. 所有笔记
  NOTES.forEach((n) => {
    items.push({
      type: 'NOTE',
      title: `${n.num} ${n.title}`,
      meta: `${n.tag} · ${n.date}`,
      action: () => {
        go('notes', false);
        openNote(n.id);
      }
    });
  });
  // 4. 快捷指令
  items.push({
    type: 'ACTION',
    title: '切换明亮 / 暗色主题',
    meta: 'Toggle Light / Dark theme',
    action: () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
  });
  items.push({
    type: 'ACTION',
    title: '切换粒子动态背景',
    meta: 'Toggle background ripples',
    action: () => {
      const off = document.body.classList.toggle('no-particles');
      $('#fxToggle').classList.toggle('is-on', !off);
    }
  });
  items.push({
    type: 'ACTION',
    title: '切换按键触觉音效',
    meta: 'Toggle synthetic sound effects',
    action: () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('frog-sound', soundEnabled ? '1' : '0');
      $('#soundToggle').classList.toggle('is-on', soundEnabled);
      showToast(soundEnabled ? '按键音效已开启' : '按键音效已关闭');
    }
  });
  return items;
}

function openCmdPalette() {
  const modal = $('#cmdPalette');
  const input = $('#cmdInput');
  if (!modal || !input) return;
  modal.removeAttribute('hidden');
  input.value = '';
  cmdSelectedIndex = 0;
  renderCmdResults('');
  input.focus();
  playSound(800, 'sine', 0.03);
}

function closeCmdPalette() {
  const modal = $('#cmdPalette');
  if (modal) modal.setAttribute('hidden', '');
}

function renderCmdResults(query) {
  const listEl = $('#cmdList');
  if (!listEl) return;
  const q = query.trim().toLowerCase();
  cmdItems = buildCmdItems().filter((item) => {
    if (!q) return true;
    return `${item.type} ${item.title} ${item.meta}`.toLowerCase().includes(q);
  });

  if (cmdItems.length === 0) {
    listEl.innerHTML = '<div class="cmd-empty">无匹配项，请输入其他指令</div>';
    return;
  }

  cmdSelectedIndex = Math.min(cmdSelectedIndex, cmdItems.length - 1);
  listEl.innerHTML = cmdItems
    .map(
      (item, idx) => `
    <div class="cmd-item${idx === cmdSelectedIndex ? ' is-selected' : ''}" data-cmd-idx="${idx}">
      <div class="cmd-item-left">
        <span class="cmd-item-cat">${item.type}</span>
        <span class="cmd-item-title">${esc(item.title)}</span>
      </div>
      <span class="cmd-item-meta">${esc(item.meta)}</span>
    </div>`
    )
    .join('');
}

function execSelectedCmd() {
  if (cmdItems[cmdSelectedIndex]) {
    const action = cmdItems[cmdSelectedIndex].action;
    closeCmdPalette();
    if (action) action();
  }
}

/* ---------------- 初始化与事件委托 ---------------- */
function init() {
  $('#brand-name').innerHTML = `${esc(SITE.name)}<em>.</em>`;
  $('#brand-sub').textContent = SITE.latin;
  $('#brand-mark').textContent = SITE.mark;
  $('#foot-name').textContent = SITE.name;
  $('#foot-contact').textContent = SITE.contact;
  $('#foot-status').innerHTML = `<span class="status-dot"></span>${esc(SITE.status)}`;
  $('#foot-email').textContent = SITE.emails[0].addr;
  $('#foot-email').href = 'mailto:' + SITE.emails[0].addr;

  renderTabs();
  renderIndex();
  renderProjects();
  renderNotes();
  renderAbout();

  // 主题恢复
  const savedTheme = (() => { try { return localStorage.getItem('blog-theme'); } catch (e) { return null; } })();
  setTheme(savedTheme || 'dark');

  // 音效按钮状态初始化
  if (soundEnabled) $('#soundToggle').classList.add('is-on');

  // 事件委托
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) return go(tab.dataset.view);

    const ent = e.target.closest('[data-goto]');
    if (ent) return go(ent.dataset.goto);

    const row = e.target.closest('[data-project]');
    if (row) return openProject(row.dataset.project);

    // 笔记点击打开阅读抽屉
    const noteEl = e.target.closest('[data-note-id]');
    if (noteEl) return openNote(noteEl.dataset.noteId);

    if (e.target.closest('[data-close]') || e.target.id === 'sheet-bg') return closeSheet();

    // 项目分类筛选
    const chip = e.target.closest('.chip');
    if (chip && chip.dataset.cat) {
      currentCat = chip.dataset.cat;
      $$('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      playSound(700, 'sine', 0.02);
      return paintProjects();
    }

    // 视图模式切换 (list / bento)
    const vbtn = e.target.closest('[data-vmode]');
    if (vbtn) {
      viewMode = vbtn.dataset.vmode;
      localStorage.setItem('frog-view-mode', viewMode);
      $$('.view-btn').forEach((b) => b.classList.toggle('is-active', b === vbtn));
      playSound(750, 'sine', 0.02);
      return paintProjects();
    }

    // 技能点击联动搜索
    const techLi = e.target.closest('[data-search-tech]');
    if (techLi) {
      const tech = techLi.dataset.searchTech;
      go('projects', false);
      searchQuery = tech.toLowerCase();
      currentCat = 'all';
      renderProjects();
      showToast(`已筛选技术栈: ${tech}`);
      return;
    }

    // 点击复制
    const copyTarget = e.target.closest('[data-copy]');
    if (copyTarget) {
      return copyText(copyTarget.dataset.copy);
    }

    // 身份卡复制
    if (e.target.closest('#copyIntroBtn')) {
      return copyText(`青蛙 (FROG755) — ${SITE.bio}\nEmail: ${SITE.emails[0].addr}\nGitHub: ${SITE.contactUrl}`, '已复制个人名片');
    }

    // Command Palette 项点击
    const cmdItem = e.target.closest('[data-cmd-idx]');
    if (cmdItem) {
      cmdSelectedIndex = parseInt(cmdItem.dataset.cmdIdx, 10);
      return execSelectedCmd();
    }
  });

  // 主题切换按钮
  $('#themeToggle').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // 粒子开关
  $('#fxToggle').addEventListener('click', () => {
    const off = document.body.classList.toggle('no-particles');
    $('#fxToggle').classList.toggle('is-on', !off);
    playSound(600, 'sine', 0.03);
  });

  // 音效开关
  $('#soundToggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('frog-sound', soundEnabled ? '1' : '0');
    $('#soundToggle').classList.toggle('is-on', soundEnabled);
    if (soundEnabled) playSound(800, 'sine', 0.04);
    showToast(soundEnabled ? '按键音效已开启' : '按键音效已关闭');
  });

  // Command Palette 触发器与键盘快捷键
  $('#cmdTrigger').addEventListener('click', openCmdPalette);
  $('#cmdBackdrop').addEventListener('click', closeCmdPalette);

  const cmdInput = $('#cmdInput');
  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
      cmdSelectedIndex = 0;
      renderCmdResults(e.target.value);
    });
    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdSelectedIndex = Math.min(cmdSelectedIndex + 1, cmdItems.length - 1);
        renderCmdResults(cmdInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdSelectedIndex = Math.max(cmdSelectedIndex - 1, 0);
        renderCmdResults(cmdInput.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execSelectedCmd();
      } else if (e.key === 'Escape') {
        closeCmdPalette();
      }
    });
  }

  // 全局键盘监听
  document.addEventListener('keydown', (e) => {
    // Cmd+K / Ctrl+K 打开命令面板
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const modal = $('#cmdPalette');
      if (modal && !modal.hasAttribute('hidden')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
      return;
    }

    if (e.key === 'Escape') {
      closeCmdPalette();
      closeSheet();
      return;
    }

    // 抽屉展开时 Left / Right 导航项目或笔记
    if ($('#sheet').classList.contains('is-open')) {
      if (currentProjectIndex !== -1) {
        if (e.key === 'ArrowLeft' && currentProjectIndex > 0) {
          openProject(PROJECTS[currentProjectIndex - 1].id);
        } else if (e.key === 'ArrowRight' && currentProjectIndex < PROJECTS.length - 1) {
          openProject(PROJECTS[currentProjectIndex + 1].id);
        }
      } else if (currentNoteIndex !== -1) {
        if (e.key === 'ArrowLeft' && currentNoteIndex > 0) {
          openNote(NOTES[currentNoteIndex - 1].id);
        } else if (e.key === 'ArrowRight' && currentNoteIndex < NOTES.length - 1) {
          openNote(NOTES[currentNoteIndex + 1].id);
        }
      }
      return;
    }

    // 如果焦点在输入框中，忽略数字键
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const n = parseInt(e.key, 10);
    if (!isNaN(n) && n >= 1 && n <= VIEWS.length && !e.metaKey && !e.ctrlKey) {
      go(VIEWS[n - 1].id);
    }
  });

  // 时钟更新 (实时秒针跳动)
  const clock = $('#clock');
  const tick = () => {
    const d = new Date();
    const p = (x) => String(x).padStart(2, '0');
    clock.textContent = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);

  // 初始粒子与路由判断
  initParticles();

  const hash = (location.hash || '').replace('#', '');
  if (hash.startsWith('project/')) {
    const pid = hash.replace('project/', '');
    go('projects', false);
    setTimeout(() => openProject(pid), 100);
  } else if (hash.startsWith('note/')) {
    const nid = hash.replace('note/', '');
    go('notes', false);
    setTimeout(() => openNote(nid), 100);
  } else {
    go(hash || 'index', false);
  }
}

document.addEventListener('DOMContentLoaded', init);
