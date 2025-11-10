// /SIEMON/js/product.grid.js
import { PRODUCTS } from './products.siemon.js';

// ===== DETECCIÓN DE RUTAS PARA GITHUB PAGES =====
const path = window.location.pathname;
const isInProductos = path.includes('/productos/');
const isGitHubPages = path.includes('/ds3-siemon/');
const repoName = isGitHubPages ? '/ds3-siemon/' : '/';

let PREFIX = isInProductos ? '../' : './';
if (isGitHubPages && !isInProductos) {
  PREFIX = repoName;
}

const LOGO_FALLBACK = PREFIX + 'SIEMON/icons/Siemonlogo.png';

console.log('🔍 Configuración:', { path, isGitHubPages, PREFIX });

// Normaliza rutas
const fixRel = (u) => {
  if (!u) return LOGO_FALLBACK;
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:')) return u;
  
  let cleanUrl = u;
  if (cleanUrl.startsWith('../')) cleanUrl = cleanUrl.slice(3);
  else if (cleanUrl.startsWith('./')) cleanUrl = cleanUrl.slice(2);
  else if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.slice(1);
  
  if (isGitHubPages && !isInProductos) return repoName + cleanUrl;
  if (isInProductos) return '../' + cleanUrl;
  return './' + cleanUrl;
};

const grid = document.getElementById('grid');
const chips = document.querySelectorAll('[data-filter]');
const inputQ = document.getElementById('q');
const sortSel = document.getElementById('sort');
const countVisible = document.getElementById('countVisible');
const btnMore = document.getElementById('btnMore');

let state = {
  filter: 'all',
  q: '',
  sort: '',
  page: 1,
  pageSize: 9,
};

const normalize = s => (s||'').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');

function apply(){
  const term = normalize(state.q);
  let list = PRODUCTS.filter(p => {
    const catOK = state.filter === 'all' || p.category === state.filter;
    const txt = `${p.name} ${p.sku}`;
    const qOK = !term || normalize(txt).includes(term);
    return catOK && qOK;
  });
  
  if (state.sort === 'name') list.sort((a,b)=> a.name.localeCompare(b.name));
  if (state.sort === 'model') list.sort((a,b)=> a.sku.localeCompare(b.sku));
  return list;
}

function card(p){
  const href = p.href || `${PREFIX}productos/index.html?sku=${encodeURIComponent(p.sku)}`;
  let rawImg = (p.gallery && p.gallery[0]) || p.image;
  let img = fixRel(rawImg);
  
  return `
    <a href="${href}" class="card group bg-white rounded-xl shadow border hover:shadow-lg transition p-5"
       data-cat="${p.category}" data-name="${p.name}" data-model="${p.sku}">
      <div class="h-40 flex items-center justify-center">
        <img src="${img}" 
             alt="${p.sku}" 
             class="max-h-full object-contain group-hover:scale-105 transition"
             loading="lazy"
             onerror="this.src='${LOGO_FALLBACK}'; this.onerror=null;">
      </div>
      <div class="pt-4 text-center">
        <h3 class="font-bold">${p.name}</h3>
        <p class="text-sm text-gray-600 mt-1">Ref. ${p.sku}</p>
        <div class="mt-3 text-blue-600 font-semibold">Ver producto</div>
      </div>
    </a>`;
}

function postRenderImageEnhancements(){
  grid.querySelectorAll('img').forEach(img => {
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    if (!img.dataset.errorHandled) {
      img.dataset.errorHandled = 'true';
      img.addEventListener('error', function() {
        this.src = LOGO_FALLBACK;
      }, { once: true });
    }
  });
}

function render(animate = true){
  const all = apply();
  const slice = all.slice(0, state.page * state.pageSize);
  
  if (animate) {
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(10px)';
  }
  
  setTimeout(() => {
    grid.innerHTML = slice.map(card).join('');
    postRenderImageEnhancements();
    
    if (animate) {
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
      
      const cards = grid.querySelectorAll('.card');
      cards.forEach((c, i) => {
        c.style.opacity = '0';
        c.style.transform = 'translateY(20px)';
        setTimeout(() => {
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        }, i * 50);
      });
    }
    
    if (countVisible) {
      countVisible.style.transform = 'scale(1.2)';
      countVisible.textContent = all.length;
      setTimeout(() => { countVisible.style.transform = 'scale(1)'; }, 200);
    }
    
    if (btnMore) {
      const hasMore = slice.length < all.length;
      if (hasMore) {
        const remaining = all.length - slice.length;
        btnMore.style.display = 'inline-flex';
        btnMore.disabled = false;
        btnMore.innerHTML = `<i class="fa-solid fa-chevron-down mr-2"></i>Cargar más (${remaining} restantes)`;
      } else {
        btnMore.style.display = 'none';
      }
    }
  }, animate ? 150 : 0);
}

// Eventos filtros
chips.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    chips.forEach(b => {
      b.classList.remove('active');
      b.style.transform = 'scale(1)';
    });
    btn.classList.add('active');
    btn.style.transform = 'scale(1.05)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
    state.filter = btn.getAttribute('data-filter');
    state.page = 1;
    render(true);
  });
});

// Búsqueda
if (inputQ) {
  let searchTimeout;
  inputQ.addEventListener('input', e=>{
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.q = e.target.value;
      state.page = 1;
      render(true);
    }, 300);
  });
}

// Ordenamiento
if (sortSel) {
  sortSel.addEventListener('change', e=>{
    state.sort = e.target.value;
    state.page = 1;
    render(true);
  });
}

// Cargar más
if (btnMore) {
  btnMore.addEventListener('click', ()=>{
    const all = apply();
    const currentShown = state.page * state.pageSize;
    if (currentShown < all.length) {
      state.page++;
      btnMore.style.transform = 'scale(0.95)';
      setTimeout(() => { btnMore.style.transform = 'scale(1)'; }, 100);
      render(false);
      setTimeout(() => {
        const cards = grid.querySelectorAll('.card');
        const newCards = Array.from(cards).slice(currentShown);
        newCards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 50);
        });
        if (newCards.length > 0) {
          setTimeout(() => {
            newCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 200);
        }
      }, 100);
    }
  });
}

// ============================================
// 🔥 INICIALIZACIÓN FORZADA
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGrid);
} else {
  initGrid();
}

function initGrid() {
  console.log('🚀 Inicializando grid...');
  
  // Limpiar contenido previo
  if (grid) grid.innerHTML = '';
  
  // Activar filtro "Todos"
  chips.forEach(chip => {
    if (chip.getAttribute('data-filter') === 'all') {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
  
  // Reset estado
  state.filter = 'all';
  state.page = 1;
  state.q = '';
  state.sort = '';
  
  // Renderizar
  render(false);
  console.log('✅ Grid listo');
}