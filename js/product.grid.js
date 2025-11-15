// /SIEMON/js/product.grid.js
import { PRODUCTS } from './products.siemon.js';

/* ============================================================
    🔥 CONFIGURACIÓN DE RUTAS (GITHUB PAGES + LOCAL)
    ============================================================ */

// ¿Estoy en GitHub Pages?
const isGitHub = window.location.hostname.includes('github.io');

// BASE:
//   - En GitHub:  /ds3-siemon/SIEMON/
//   - En local:   /SIEMON/
const BASE_SIEMON = isGitHub ? '/ds3-siemon/' : '/';

/**
 * Construye la ruta ABSOLUTA de una imagen de producto.
 * Espera paths relativos a la carpeta SIEMON, por ejemplo:
 * imgs/siemon/cat5e/xxxxx.jpg
 */
function imgAsset(path) {
  if (!path) return null;

  let clean = path.trim();

  // Quita ./, ../ y / iniciales
  while (clean.startsWith('./') || clean.startsWith('../') || clean.startsWith('/')) {
    if (clean.startsWith('./')) clean = clean.slice(2);
    else if (clean.startsWith('../')) clean = clean.slice(3);
    else if (clean.startsWith('/')) clean = clean.slice(1);
  }

  return BASE_SIEMON + clean;
}

// Logo fallback (absoluto)
const LOGO_FALLBACK = BASE_SIEMON + 'icons/Siemonlogo.png';

console.log('🧭 BASE_SIEMON:', BASE_SIEMON);
console.log('🖼 LOGO_FALLBACK:', LOGO_FALLBACK);

/* ============================================================
    GRID
    ============================================================ */

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

let isInitialized = false;

const normalize = s =>
  (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

function apply() {
  const term = normalize(state.q);

  let list = PRODUCTS.filter(p => {
    const catOK = state.filter === 'all' || p.category === state.filter;
    const txt = `${p.name} ${p.sku}`;
    const qOK = !term || normalize(txt).includes(term);
    return catOK && qOK;
  });

  if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === 'model') list.sort((a, b) => a.sku.localeCompare(b.sku));

  return list;
}

// URL ABSOLUTA para detalle de producto
const DETAIL_URL_BASE = BASE_SIEMON + 'productos/index.html';

function card(p) {
  const href = p.href || `${DETAIL_URL_BASE}?sku=${encodeURIComponent(p.sku)}`;

  const rawImg = (p.gallery && p.gallery[0]) || p.image;
  let img = imgAsset(rawImg) || LOGO_FALLBACK;

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

function postRenderImageEnhancements() {
  if (!grid) return;

  grid.querySelectorAll('img').forEach(img => {
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';

    if (!img.dataset.errorHandled) {
      img.dataset.errorHandled = 'true';
      img.addEventListener(
        'error',
        function () {
          this.src = LOGO_FALLBACK;
        },
        { once: true }
      );
    }
  });
}

function render(animate = true) {
  if (!grid) return;

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
      setTimeout(() => {
        countVisible.style.transform = 'scale(1)';
      }, 200);
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

chips.forEach(btn => {
  btn.addEventListener('click', () => {
    chips.forEach(b => {
      b.classList.remove('active');
      b.style.transform = 'scale(1)';
    });

    btn.classList.add('active');
    btn.style.transform = 'scale(1.05)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 200);

    state.filter = btn.getAttribute('data-filter');
    state.page = 1;

    render(true);
  });
});

if (inputQ) {
  let searchTimeout;
  inputQ.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.q = e.target.value;
      state.page = 1;
      render(true);
    }, 300);
  });
}

if (sortSel) {
  sortSel.addEventListener('change', e => {
    state.sort = e.target.value;
    state.page = 1;
    render(true);
  });
}

if (btnMore) {
  btnMore.addEventListener('click', () => {
    const all = apply();
    const currentShown = state.page * state.pageSize;

    if (currentShown < all.length) {
      state.page++;
      render(false);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGrid);
} else {
  initGrid();
}

function initGrid() {
  if (isInitialized) {
    console.warn('⚠️ Grid ya inicializado, evitando duplicación');
    return;
  }

  isInitialized = true;
  console.log('⚙️ Inicializando grid...');

  if (grid) {
    grid.innerHTML = '';
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }

  chips.forEach(chip => {
    if (chip.getAttribute('data-filter') === 'all') {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  state.filter = 'all';
  state.page = 1;
  state.q = '';
  state.sort = '';

  render(false);

  console.log('✅ Grid listo');
}
// --- CÓDIGO AÑADIDO PARA FORZAR CLICK EN RECARGA (CON DELAY) ---

// 1. Detectar si la página fue recargada
// (Usamos performance.getEntriesByType para compatibilidad moderna)
const navigationEntries = performance.getEntriesByType("navigation");
let navigationType = '';
if (navigationEntries.length > 0) {
  navigationType = navigationEntries[0].type;
}

// 2. Comprobar si el tipo de navegación fue 'reload'
if (navigationType === 'reload') {
  console.log('RECARGA de página detectada.');

  // 3. Esperar a que *todo* cargue (evento 'load')
  window.addEventListener('load', () => {
    console.log('Página completamente cargada (evento load). Iniciando espera de 3 segundos...');

    // 4. Esperar 3 segundos (3000 ms)
    setTimeout(() => {
      console.log('3 segundos han pasado. Ejecutando click en [data-filter="all"]');

      // 5. Buscar el botón "Limpiar filtros" (el que tiene data-filter="all")
      const btnLimpiarFiltros = document.querySelector('[data-filter="all"]');

      if (btnLimpiarFiltros) {
        console.log('Botón "Limpiar filtros" encontrado. Forzando click...');
        
        // 6. Simular el click
        btnLimpiarFiltros.click();
      } else {
        console.warn('No se pudo encontrar el botón "Limpiar filtros" [data-filter="all"] para el click automático.');
      }
    }, 1000); // 3000 milisegundos = 3 segundos

  });

} else {
  // 'navigate', 'back_forward', etc.
  console.log(`Navegación normal (${navigationType}). No se forzará click.`);
}
// --- FIN DEL CÓDIGO AÑADIDO ---