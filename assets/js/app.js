/* 视图切换 + 项目详情 + 主题 + 示波器 + 粒子背景 */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const VIEWS = [
  { id: 'index', num: '00', label: 'INDEX', title: '索引', sub: '总览与快速入口' },
  { id: 'projects', num: '01', label: 'PROJECTS', title: '项目', sub: '全部收录项目' },
  { id: 'notes', num: '02', label: 'NOTES', title: '笔记', sub: '文章与方法论' },
  { id: 'about', num: '03', label: 'ABOUT', title: '关于', sub: '工作方式与工具栈' }
];

const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || id;
const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff66';

/* ---------------- 渲染 ---------------- */

function renderTabs() {
  $('#tabs').innerHTML = VIEWS.map(
    (v) => `<button class="tab" role="tab" data-view="${v.id}">${v.num} ${v.label}</button>`
  ).join('');
}

function renderIndex() {
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 3);

  $('#view-index').innerHTML = `
    <section class="hero">
      <div class="wrap">
        <div class="hero-grid">
          <h1 class="hero-title">BUILDING<br>SOFTWARE THAT<br><em>WORKS ITSELF.</em></h1>
          <aside class="identity">
            <span class="k">01 / Who I Am</span>
            <h2>HI, I'M ${esc(SITE.who)}.</h2>
            <p>${esc(SITE.bio)}</p>
            <span class="who"><span class="status-dot"></span>${esc(SITE.status)}</span>
          </aside>
        </div>
      </div>

      <div class="scope">
        <span class="scope-tag">02 / Signal &amp; Waveform</span>
        <canvas id="oscilloscope"></canvas>
      </div>

      <div class="wrap">
        <div class="hero-foot">
          <div><span class="k mono">Projects</span><span class="v">${String(PROJECTS.length).padStart(2, '0')}</span></div>
          <div><span class="k mono">Agents</span><span class="v">${String(PROJECTS.filter((p) => p.cat === 'agents').length).padStart(2, '0')}</span></div>
          <div><span class="k mono">Notes</span><span class="v">${String(NOTES.length).padStart(2, '0')}</span></div>
          <div><span class="k mono">Status</span><span class="v" style="font-size:15px"><span class="status-dot"></span>${esc(SITE.status)}</span></div>
        </div>
      </div>
    </section>

    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Entries</h2>
          <span class="section-meta mono">选择入口进入</span>
        </div>
        <div class="entries">
          ${VIEWS.map(
            (v) => `
            <button class="entry" data-goto="${v.id}">
              <span class="entry-num mono">${v.num}</span>
              <h3 class="entry-title">${esc(v.title)}</h3>
              <span class="entry-sub">${esc(v.sub)}</span>
              <span class="entry-arrow">&#8599;</span>
            </button>`
          ).join('')}
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Selected Work</h2>
          <button class="section-meta mono" data-goto="projects" style="cursor:pointer">查看全部 &#8594;</button>
        </div>
        <div class="featured">
          ${featured
            .map(
              (p) => `
            <article class="fcard" data-project="${p.id}">
              <div class="fcard-top mono"><span>${p.num}</span><span>${esc(p.year)}</span></div>
              <h3 class="fcard-title">${esc(p.title)}</h3>
              <p class="fcard-sub">${esc(p.subtitle)}</p>
              <p class="fcard-desc">${esc(p.summary)}</p>
            </article>`
            )
            .join('')}
        </div>
      </section>
    </div>`;

  initScope();
}

function renderProjects() {
  $('#view-projects').innerHTML = `
    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Projects</h2>
          <span class="section-meta mono" id="pj-count"></span>
        </div>
        <div class="filters" id="filters">
          ${CATEGORIES.map(
            (c) =>
              `<button class="chip${c.id === 'all' ? ' is-active' : ''}" data-cat="${c.id}">${esc(c.label)}</button>`
          ).join('')}
        </div>
        <div class="plist" id="plist"></div>
      </section>
    </div>`;
  paintList('all');
}

function paintList(cat) {
  const list = cat === 'all' ? PROJECTS : PROJECTS.filter((p) => p.cat === cat);
  $('#plist').innerHTML = list
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
        <span class="prow-arrow">&#8594;</span>
      </div>`
    )
    .join('');
  $('#pj-count').textContent = `${String(list.length).padStart(2, '0')} / ${PROJECTS.length}`;
}

function renderNotes() {
  $('#view-notes').innerHTML = `
    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Notes &amp; Writing</h2>
          <span class="section-meta mono">${String(NOTES.length).padStart(2, '0')} 篇</span>
        </div>
        ${NOTES.map(
          (n) => `
          <article class="note">
            <div class="note-date">${esc(n.date)}</div>
            <div>
              <h3 class="note-title">${esc(n.title)}</h3>
              <p class="note-desc">${esc(n.desc)}</p>
            </div>
            <div class="note-tag">${esc(n.tag)}</div>
          </article>`
        ).join('')}
      </section>
    </div>`;
}

function renderAbout() {
  $('#view-about').innerHTML = `
    <div class="wrap">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">About</h2>
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
        </div>

        <div class="motto">
          <span class="mono">Philosophy</span>
          <h3>${esc(SITE.motto.split('、')[0])}、${esc(SITE.motto.split('、')[1])}、<em>${esc(SITE.motto.split('、')[2] || '')}</em></h3>
          <p>${esc(SITE.mottoText)}</p>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Toolkit</h2>
          <span class="section-meta mono">硬件 · 软件 · AI</span>
        </div>
        <div class="stack-grid">
          ${ABOUT.stackGroups
            .map(
              (g) => `
            <div class="stack-col">
              <h4>${esc(g.label)}</h4>
              <ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
            </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Get In Touch</h2>
          <span class="section-meta mono">${esc(SITE.contact)}</span>
        </div>
        <div class="contact-grid">
          <a class="contact-row" href="mailto:${esc(SITE.emails[0].addr)}">
            <span class="contact-k">${esc(SITE.emails[0].label)}</span>
            <span class="contact-v">${esc(SITE.emails[0].addr)}</span>
            <span class="contact-go">&#8599;</span>
          </a>
          <a class="contact-row" href="mailto:${esc(SITE.emails[1].addr)}">
            <span class="contact-k">${esc(SITE.emails[1].label)}</span>
            <span class="contact-v">${esc(SITE.emails[1].addr)}</span>
            <span class="contact-go">&#8599;</span>
          </a>
          <a class="contact-row" href="${esc(SITE.contactUrl)}" target="_blank" rel="noopener">
            <span class="contact-k">GitHub</span>
            <span class="contact-v">${esc(SITE.contact)}</span>
            <span class="contact-go">&#8599;</span>
          </a>
        </div>
      </section>
    </div>`;
}

/* ---------------- 详情面板 ---------------- */

function openProject(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;
  $('#sheet-body').innerHTML = `
    <div class="sheet-top">
      <span class="mono">${p.num} / ${esc(catLabel(p.cat))} / ${esc(p.year)}</span>
      <button class="sheet-close" data-close>&#10005;</button>
    </div>
    <span class="status" data-s="${esc(p.status)}">${esc(p.status)}</span>
    <h2 class="sheet-title">${esc(p.title)}</h2>
    <p class="sheet-sub">${esc(p.subtitle)}</p>
    <p class="sheet-sum">${esc(p.summary)}</p>

    <div class="sheet-sec">
      <h5>Overview</h5>
      ${p.body.map((t) => `<p>${esc(t)}</p>`).join('')}
    </div>

    <div class="sheet-sec">
      <h5>Key Points</h5>
      <ul>${p.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>

    <div class="sheet-sec">
      <h5>Stack</h5>
      <div class="tags">${p.stack.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div>
    </div>

    ${
      p.links && p.links.length
        ? `<div class="sheet-sec"><h5>Links</h5><div class="sheet-links">${p.links
            .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} &#8599;</a>`)
            .join('')}</div></div>`
        : ''
    }`;
  $('#sheet').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  $('#sheet').classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ---------------- 视图切换 ---------------- */

function go(id) {
  const v = VIEWS.find((x) => x.id === id) || VIEWS[0];
  $$('.view').forEach((el) => el.classList.toggle('is-active', el.id === 'view-' + v.id));
  $$('.tab').forEach((el) => el.classList.toggle('is-active', el.dataset.view === v.id));
  if (location.hash.slice(1) !== v.id) location.hash = v.id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (v.id === 'index') requestAnimationFrame(resizeScope);
}

/* ---------------- 主题 ---------------- */

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('blog-theme', t); } catch (e) {}
}

/* ---------------- 示波器 ---------------- */

let scopeCtx = null, scopePhase = 0, scopeRaf = null;

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
    scopePhase += (e.clientX - r.left) / r.width * 0.05;
  });
  drawScope();
}

function drawScope() {
  const c = $('#oscilloscope');
  if (!c || !scopeCtx) return;
  const ctx = scopeCtx;
  const w = c.width, h = c.height, mid = h / 2;
  ctx.clearRect(0, 0, w, h);

  // 参考线
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(128,128,128,.18)';
  ctx.lineWidth = 1;
  ctx.moveTo(0, mid); ctx.lineTo(w, mid);
  ctx.stroke();

  const color = accent();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  for (let x = 0; x < w; x++) {
    const amp = Math.sin((x / w) * Math.PI) * (h * 0.26);
    const y = mid + Math.sin(x * 0.015 + scopePhase) * amp;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  scopePhase += 0.02;
  scopeRaf = requestAnimationFrame(drawScope);
}

/* ---------------- 粒子背景（Three.js，缺失时静默降级） ---------------- */

function initParticles() {
  if (typeof THREE === 'undefined') {
    document.body.classList.add('no-particles');
    const btn = $('#fxToggle');
    if (btn) { btn.disabled = true; btn.title = '粒子背景不可用（未加载 Three.js）'; }
    return;
  }
  const canvas = $('#particle-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 15);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const geometry = new THREE.PlaneGeometry(80, 55, 180, 120);
  const vertexShader = `
    uniform float uTime; uniform vec3 uMouse;
    varying float vDist; varying float vElevation;
    void main() {
      float d = distance(position.xy, uMouse.xy);
      vDist = d;
      float baseWave = sin(position.x * 0.15 + uTime * 1.2) * cos(position.y * 0.15 + uTime * 1.2) * 0.2;
      float mouseWave = sin(d - uTime * 6.0) * smoothstep(14.0, 0.0, d);
      vec3 p = position; p.z += baseWave + mouseWave;
      vElevation = baseWave + mouseWave;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (16.0 / -mv.z) * (smoothstep(14.0, 0.0, d) * 2.2 + 0.8);
    }`;
  const fragmentShader = `
    uniform vec3 uColor;
    varying float vDist; varying float vElevation;
    void main() {
      vec2 t = gl_PointCoord - vec2(0.5);
      float f = dot(t, t);
      if (f > 0.25) discard;
      float alpha = smoothstep(14.0, 4.0, vDist) * 0.7 + 0.04;
      float waveGlow = smoothstep(-1.2, 1.2, vElevation) * 0.4 + 0.6;
      float glow = 1.0 - f * 4.0;
      gl_FragColor = vec4(uColor, alpha * glow * waveGlow);
    }`;

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uColor: { value: new THREE.Color(accent()) }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader, fragmentShader, uniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  scene.add(new THREE.Points(geometry, material));

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
    uniforms.uColor.value.set(accent());
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, target);
    current.lerp(target, 0.06);
    uniforms.uMouse.value.copy(current);
    renderer.render(scene, camera);
  })();
}

/* ---------------- 初始化 ---------------- */

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

  // 默认暗色；用户手动切换过则记住其选择
  const saved = (() => { try { return localStorage.getItem('blog-theme'); } catch (e) { return null; } })();
  setTheme(saved || 'dark');

  // 事件委托
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) return go(tab.dataset.view);

    const ent = e.target.closest('[data-goto]');
    if (ent) return go(ent.dataset.goto);

    const row = e.target.closest('[data-project]');
    if (row) return openProject(row.dataset.project);

    if (e.target.closest('[data-close]') || e.target.id === 'sheet-bg') return closeSheet();

    const chip = e.target.closest('.chip');
    if (chip) {
      $$('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      return paintList(chip.dataset.cat);
    }
  });

  $('#themeToggle').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  $('#fxToggle').addEventListener('click', () => {
    const off = document.body.classList.toggle('no-particles');
    $('#fxToggle').classList.toggle('is-on', !off);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return closeSheet();
    const n = parseInt(e.key, 10);
    if (!isNaN(n) && n < VIEWS.length && !e.metaKey && !e.ctrlKey) go(VIEWS[n].id);
  });

  const clock = $('#clock');
  const tick = () => {
    const d = new Date();
    const p = (x) => String(x).padStart(2, '0');
    clock.textContent = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  tick();
  setInterval(tick, 30000);

  initParticles();
  go((location.hash || '').replace('#', '') || 'index');
}

document.addEventListener('DOMContentLoaded', init);
