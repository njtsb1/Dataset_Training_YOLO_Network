const DEFAULT_LANG = 'en-US';
const LANG_KEY = 'yolo_demo_lang';
const THEME_KEY = 'yolo_demo_theme';

// Minimal translations for UI strings
const TRANSLATIONS = {
  'en-US': {
    title: 'YOLO Dataset & Training',
    heroTitle: 'YOLO Dataset & Training',
    heroDesc: 'A small, responsive interface to demonstrate dataset workflow, detection preview and training notes.',
    workflow: 'Workflow',
    notesTitle: 'Notes',
    previewBtn: 'Preview (client-side)',
    resetBtn: 'Reset',
    chooseImage: 'Choose an image',
    noImage: 'No image selected',
    footer: 'Developed by Nivaldo Beirão',
    confLabel: 'Confidence threshold'
  },
  'pt-BR': {
    title: 'YOLO Base de Dados e Treinamento',
    heroTitle: 'YOLO Base de Dados e Treinamento Rápido',
    heroDesc: 'Interface pequena e responsiva para demonstrar fluxo de dados, pré-visualização e notas de treinamento.',
    workflow: 'Fluxo de trabalho',
    notesTitle: 'Observações',
    previewBtn: 'Pré-visualizar (cliente)',
    resetBtn: 'Redefinir',
    chooseImage: 'Escolha uma imagem',
    noImage: 'Nenhuma imagem selecionada',
    footer: 'Desenvolvido por Nivaldo Beirão',
    confLabel: 'Limiar de confiança'
  },
  'es-ES': {
    title: 'YOLO Conjunto de Datos y Entrenamiento',
    heroTitle: 'YOLO Conjunto de Datos y Entrenamiento Rápida',
    heroDesc: 'Interfaz pequeña y responsiva para demostrar flujo de datos, vista previa y notas de entrenamiento.',
    workflow: 'Flujo de trabajo',
    notesTitle: 'Notas',
    previewBtn: 'Vista previa (cliente)',
    resetBtn: 'Restablecer',
    chooseImage: 'Elige una imagen',
    noImage: 'Ninguna imagen seleccionada',
    footer: 'Desarrollado por Nivaldo Beirão',
    confLabel: 'Umbral de confianza'
  },
  'es-419': {
    title: 'YOLO Datos y Entrenamiento',
    heroTitle: 'YOLO Datos y Entrenamiento Rápida',
    heroDesc: 'Interfaz pequeña y adaptable para demostrar flujo de datos, vista previa y notas de entrenamiento.',
    workflow: 'Flujo de trabajo',
    notesTitle: 'Notas',
    previewBtn: 'Vista previa (cliente)',
    resetBtn: 'Restablecer',
    chooseImage: 'Selecciona una imagen',
    noImage: 'Ninguna imagen seleccionada',
    footer: 'Desarrollado por Nivaldo Beirão',
    confLabel: 'Umbral de confianza'
  }
};

// DOM elements
const themeToggle = document.getElementById('theme-toggle');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');
const langSelect = document.getElementById('lang-select');
const siteTitle = document.getElementById('site-title');
const heroTitle = document.getElementById('hero-title');
const heroDesc = document.getElementById('hero-desc');
const previewBtn = document.getElementById('preview-btn');
const resetBtn = document.getElementById('reset-btn');
const previewImg = document.getElementById('preview-img');
const previewCaption = document.getElementById('preview-caption');
const imageInput = document.getElementById('image-input');
const confRange = document.getElementById('conf-range');
const confValue = document.getElementById('conf-value');
const showBoxes = document.getElementById('show-boxes');

// Initialize theme from localStorage or default to dark
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || 'dark';
  setTheme(theme);
}
function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme === 'light');
  // toggle icons and aria-pressed
  const isDark = theme === 'dark';
  iconMoon.classList.toggle('hidden', !isDark);
  iconSun.classList.toggle('hidden', isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  localStorage.setItem(THEME_KEY, theme);
}
themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

// Initialize language from localStorage or default
function initLang() {
  const saved = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  langSelect.value = saved;
  applyLang(saved);
}
function applyLang(code) {
  const t = TRANSLATIONS[code] || TRANSLATIONS[DEFAULT_LANG];
  document.documentElement.lang = code;
  siteTitle.textContent = t.title;
  heroTitle.textContent = t.heroTitle;
  heroDesc.textContent = t.heroDesc;
  previewBtn.textContent = t.previewBtn;
  resetBtn.textContent = t.resetBtn;
  previewCaption.textContent = t.noImage;
  document.getElementById('notes-title').textContent = t.notesTitle;
  document.getElementById('workflow-title').textContent = t.workflow;
  document.getElementById('footer-text').textContent = t.footer;
  document.getElementById('image-label').textContent = t.chooseImage;
  // update confidence label
  document.querySelector('label[for="conf-range"]').firstChild && (document.querySelector('label[for="conf-range"]').childNodes[0].nodeValue = `${t.confLabel}: `);
  localStorage.setItem(LANG_KEY, code);
}
langSelect.addEventListener('change', (e) => applyLang(e.target.value));

// Preview logic (client-side simulation)
function resetPreview() {
  previewImg.src = '';
  previewImg.alt = 'Preview area';
  previewCaption.textContent = TRANSLATIONS[langSelect.value]?.noImage || TRANSLATIONS[DEFAULT_LANG].noImage;
  imageInput.value = '';
}
previewBtn.addEventListener('click', () => {
  const file = imageInput.files && imageInput.files[0];
  if (!file) {
    previewCaption.textContent = TRANSLATIONS[langSelect.value]?.noImage || TRANSLATIONS[DEFAULT_LANG].noImage;
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    previewImg.src = ev.target.result;
    previewCaption.textContent = file.name;
    // simulate boxes by drawing an overlay canvas if showBoxes is checked
    if (showBoxes.checked) {
      drawSimulatedBoxes(previewImg);
    }
  };
  reader.readAsDataURL(file);
});
resetBtn.addEventListener('click', resetPreview);

// Confidence range display
confRange.addEventListener('input', (e) => {
  confValue.textContent = Number(e.target.value).toFixed(2);
});

// Simulate bounding boxes overlay (client-side only)
function drawSimulatedBoxes(imgElement) {
  // remove existing overlay if any
  const existing = document.getElementById('overlay-canvas');
  if (existing) existing.remove();

  const canvas = document.createElement('canvas');
  canvas.id = 'overlay-canvas';
  canvas.style.position = 'absolute';
  canvas.style.maxWidth = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.setAttribute('aria-hidden', 'true');

  // position canvas over the image
  const wrapper = imgElement.parentElement;
  wrapper.style.position = 'relative';
  wrapper.appendChild(canvas);

  imgElement.onload = () => {
    const w = imgElement.clientWidth;
    const h = imgElement.clientHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    // draw a few simulated boxes with labels
    const boxes = [
      { x: 0.08, y: 0.55, w: 0.25, h: 0.35, label: 'object I', color: 'rgba(255,215,0,0.9)' },
      { x: 0.12, y: 0.18, w: 0.35, h: 0.25, label: 'object II', color: 'rgba(220,20,60,0.9)' },
      { x: 0.62, y: 0.12, w: 0.28, h: 0.22, label: 'object III', color: 'rgba(34,139,34,0.9)' }
    ];

    boxes.forEach(b => {
      const x = b.x * w;
      const y = b.y * h;
      const bw = b.w * w;
      const bh = b.h * h;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = Math.max(2, Math.round(Math.min(w, h) * 0.006));
      ctx.strokeRect(x, y, bw, bh);

      // label background
      ctx.fillStyle = b.color;
      ctx.font = `${Math.max(12, Math.round(w * 0.03))}px sans-serif`;
      const text = `${b.label} 0.95`;
      const textWidth = ctx.measureText(text).width;
      const textHeight = parseInt(ctx.font, 10) + 6;
      ctx.fillRect(x, y - textHeight, textWidth + 8, textHeight);
      ctx.fillStyle = '#fff';
      ctx.fillText(text, x + 4, y - 6);
    });
  };

  // if image already loaded, trigger onload manually
  if (imgElement.complete && imgElement.naturalWidth !== 0) {
    imgElement.onload();
  }
}

// Initialize UI
initTheme();
initLang();
resetPreview();

// Accessibility: keyboard shortcut to toggle theme (T) and language (L)
document.addEventListener('keydown', (e) => {
  if (e.key === 'T' || e.key === 't') {
    themeToggle.click();
  }
  if (e.key === 'L' || e.key === 'l') {
    // cycle languages
    const opts = Array.from(langSelect.options).map(o => o.value);
    const idx = opts.indexOf(langSelect.value);
    const next = opts[(idx + 1) % opts.length];
    langSelect.value = next;
    applyLang(next);
  }
});
