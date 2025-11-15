
document.addEventListener('DOMContentLoaded', async () => {
  
  
  const path = window.location.pathname;
  const isInProductos = path.includes('/productos/');
  const isInRoot = path.endsWith('/') || path.endsWith('index.html') || !path.includes('/productos');
  
  
  const PREFIX = isInProductos ? '../' : './';
  
  console.log(' Ubicación detectada:', {
    path,
    isInProductos,
    PREFIX
  });

  
  const PATHS = {
    logo: PREFIX + 'SIEMON/icons/Siemonlogo.png',
    logoDS3: PREFIX + 'SIEMON/icons/Logods3.png',
    navbar: PREFIX + 'components/navbar.html'
  };

  
  const mount = document.querySelector('#navbar');
  
  try {
    const response = await fetch(PATHS.navbar, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'text/html' }
    });
    
    if (response.ok) {
      const html = await response.text();
      
      if (mount) {
        mount.innerHTML = html;
      } else {
        document.body.insertAdjacentHTML('afterbegin', html);
      }
      
      
      fixAllPaths(PREFIX);
      setupNavbar(PREFIX, PATHS);
      
      console.log(' Navbar cargado correctamente');
    } else {
      console.warn(' Navbar no encontrado, usando versión inline');
      createInlineNavbar(PREFIX, PATHS);
    }
  } catch (error) {
    console.error(' Error cargando navbar:', error);
    createInlineNavbar(PREFIX, PATHS);
  }

  
  function fixAllPaths(prefix) {
    const isExternal = (url) => {
      if (!url) return false;
      return /^(https?:\/\/|mailto:|tel:|#|data:)/i.test(url);
    };

    const fixPath = (path) => {
      if (!path || isExternal(path)) return path;
      
      
      if (path.startsWith(prefix)) return path;
      
      
      path = path.replace(/^\.?\/?/, '');
      
      
      if (path.startsWith('SIEMON/') || path.startsWith('components/') || 
          path.startsWith('css/') || path.startsWith('js/')) {
        return prefix + path;
      }
      
      return path;
    };

    
    document.querySelectorAll('img[src]').forEach(img => {
      const originalSrc = img.getAttribute('src');
      const fixedSrc = fixPath(originalSrc);
      if (fixedSrc !== originalSrc) {
        img.setAttribute('src', fixedSrc);
        console.log('🔧 Imagen corregida:', originalSrc, '→', fixedSrc);
      }
      
      
      img.loading = 'lazy';
      img.onerror = function() {
        console.warn('❌ Imagen no cargó:', this.src);
        this.src = prefix + 'SIEMON/icons/Siemonlogo.png';
        this.onerror = null; 
      };
    });

    
    document.querySelectorAll('a[href]').forEach(link => {
      const originalHref = link.getAttribute('href');
      if (!isExternal(originalHref) && !originalHref.startsWith('#')) {
        const fixedHref = fixPath(originalHref);
        if (fixedHref !== originalHref) {
          link.setAttribute('href', fixedHref);
          console.log('🔧 Link corregido:', originalHref, '→', fixedHref);
        }
      }
    });

    
    document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
      const originalHref = link.getAttribute('href');
      const fixedHref = fixPath(originalHref);
      if (fixedHref !== originalHref) {
        link.setAttribute('href', fixedHref);
        console.log('🔧 CSS corregido:', originalHref, '→', fixedHref);
      }
    });
  }

  
  function createInlineNavbar(prefix, paths) {
    const navbarHTML = `
      <nav class="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="${prefix}index.html" class="flex items-center gap-3">
            <img src="${paths.logo}" alt="Siemon" class="h-10" onerror="this.style.display='none'">
            <span class="font-bold text-xl text-[#D52931]">SIEMON</span>
          </a>
          
          <div class="flex items-center gap-3">
            <button id="btnSearch" class="p-2 hover:bg-gray-100 rounded-lg">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
            <button id="btnMenu" class="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      <div id="offcanvas" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/40"></div>
        <aside class="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <img src="${paths.logoDS3}" class="h-8" alt="DS3">
            <button id="btnCloseMenu" class="p-2 hover:bg-gray-100 rounded">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <div class="space-y-3">
            <a href="tel:+51996533223" class="flex items-center gap-2 text-gray-800 hover:text-[#D52931]">
              <i class="fa-solid fa-phone"></i> 996 533 223
            </a>
            <a href="tel:+51994428965" class="flex items-center gap-2 text-gray-800 hover:text-[#D52931]">
              <i class="fa-solid fa-phone"></i> 994 428 965
            </a>
            <a href="mailto:netperu100@hotmail.com" class="flex items-center gap-2 text-gray-800 hover:text-[#D52931]">
              <i class="fa-solid fa-envelope"></i> netperu100@hotmail.com
            </a>
          </div>
        </aside>
      </div>

      <div id="searchPanel" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="absolute left-1/2 -translate-x-1/2 top-10 w-[92vw] max-w-2xl">
          <div class="bg-white rounded-xl shadow-lg p-4">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-magnifying-glass text-gray-500"></i>
              <input id="searchInput" type="search" placeholder="Buscar productos..." 
                     class="flex-1 outline-none">
              <button id="btnCloseSearch" class="p-2 hover:bg-gray-100 rounded">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    if (mount) {
      mount.innerHTML = navbarHTML;
    } else {
      document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    }
    
    setupNavbar(prefix, paths);
  }

  // ===== FUNCIONALIDAD DEL NAVBAR =====
  function setupNavbar(prefix, paths) {
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => [...document.querySelectorAll(s)];

    // Offcanvas
    const offcanvas = $('#offcanvas');
    $$('#btnMenu').forEach(btn => {
      btn?.addEventListener('click', (e) => {
        e.preventDefault();
        offcanvas?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    });

    $$('#btnCloseMenu').forEach(btn => {
      btn?.addEventListener('click', () => {
        offcanvas?.classList.add('hidden');
        document.body.style.overflow = '';
      });
    });

    offcanvas?.addEventListener('click', (e) => {
      if (e.target === offcanvas) {
        offcanvas.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    // Search Panel
    const searchPanel = $('#searchPanel');
    const searchInput = $('#searchInput');
    
    $$('#btnSearch').forEach(btn => {
      btn?.addEventListener('click', (e) => {
        e.preventDefault();
        searchPanel?.classList.remove('hidden');
        setTimeout(() => searchInput?.focus(), 100);
      });
    });

    $('#btnCloseSearch')?.addEventListener('click', () => {
      searchPanel?.classList.add('hidden');
    });

    searchPanel?.addEventListener('click', (e) => {
      if (e.target === searchPanel) {
        searchPanel.classList.add('hidden');
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchPanel?.classList.add('hidden');
        offcanvas?.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    // ===== GRID DE PRODUCTOS CON PAGINACIÓN =====
    setupProductGrid(prefix, paths);

    // ===== CARRUSEL DE MARCAS =====
    setupBrandCarousel();
  }

  // ===== GRID DE PRODUCTOS =====
  function setupProductGrid(prefix, paths) {
    const grid = document.getElementById('grid');
    if (!grid) return;

    const PER_PAGE = 6;
    let currentFilter = 'all';
    let currentQuery = '';
    let currentSort = '';
    let cursor = PER_PAGE;

    const cards = Array.from(grid.querySelectorAll('.card'));
    const chips = Array.from(document.querySelectorAll('[data-filter]'));
    const inputQ = document.getElementById('q');
    const selSort = document.getElementById('sort');
    const btnMore = document.getElementById('btnMore');
    const countVisible = document.getElementById('countVisible');

    // Configurar imágenes de productos
    cards.forEach(card => {
      const img = card.querySelector('img');
      if (img) {
        const originalSrc = img.getAttribute('src');
        
        // Si la imagen no tiene el prefijo, agregarlo
        if (originalSrc && !originalSrc.startsWith('http') && !originalSrc.startsWith(prefix)) {
          img.src = prefix + originalSrc.replace(/^\.?\/?/, '');
        }
        
        img.loading = 'lazy';
        img.onerror = function() {
          console.warn(' Imagen de producto no cargó:', this.src);
          this.src = paths.logo;
          this.onerror = null;
        };
      }
    });

    const matchFilter = (card, filter) => {
      if (filter === 'all') return true;
      const cat = (card.dataset.cat || '').toLowerCase();
      if (filter === 'jack') return cat.includes('jack');
      if (filter === 'patch') return cat.includes('patch');
      if (filter === 'panel') return cat.includes('panel');
      return cat.includes(filter);
    };

    const matchQuery = (card, q) => {
      if (!q) return true;
      const name = (card.dataset.name || '').toLowerCase();
      const model = (card.dataset.model || '').toLowerCase();
      return name.includes(q) || model.includes(q);
    };

    const sortCards = (arr, mode) => {
      if (mode === 'name') {
        return arr.sort((a, b) => 
          (a.dataset.name || '').localeCompare(b.dataset.name || '')
        );
      }
      if (mode === 'model') {
        return arr.sort((a, b) => 
          (a.dataset.model || '').localeCompare(b.dataset.model || '')
        );
      }
      return arr;
    };

    const render = () => {
      let list = cards.filter(c => 
        matchFilter(c, currentFilter) && matchQuery(c, currentQuery)
      );
      list = sortCards(list, currentSort);

      cards.forEach(c => c.classList.add('hidden-card'));

      const slice = list.slice(0, cursor);
      slice.forEach(c => {
        c.classList.remove('hidden-card');
        c.classList.add('fade-in');
        setTimeout(() => c.classList.remove('fade-in'), 300);
      });

      if (countVisible) {
        countVisible.textContent = String(list.length);
      }

      const hasMore = cursor < list.length;
      if (btnMore) {
        btnMore.disabled = !hasMore;
        btnMore.style.display = list.length > PER_PAGE 
          ? 'inline-flex' 
          : (hasMore ? 'inline-flex' : 'none');
        if (list.length === 0) btnMore.style.display = 'none';
      }
    };

    const resetAndRender = () => {
      cursor = PER_PAGE;
      render();
    };

    // Event listeners
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter || 'all';
        resetAndRender();
      });
    });

    inputQ?.addEventListener('input', (e) => {
      currentQuery = (e.target.value || '').trim().toLowerCase();
      resetAndRender();
    });

    selSort?.addEventListener('change', (e) => {
      currentSort = e.target.value || '';
      resetAndRender();
    });

    btnMore?.addEventListener('click', () => {
      cursor += PER_PAGE;
      render();
    });

    resetAndRender();
  }

  
  function setupBrandCarousel() {
    const marquees = document.querySelectorAll('.brand-marquee');
    
    marquees.forEach(marquee => {
      const track = marquee.querySelector('.brand-track');
      if (!track) return;

      const items = Array.from(track.children);
      const clones = items.map(item => item.cloneNode(true));
      track.append(...clones);

      const itemCount = items.length;
      const speed = parseFloat(marquee.dataset.speed || '2');
      const duration = Math.max(10, (itemCount * 2.2) / speed);
      
      track.style.setProperty('--dur', duration + 's');

      // Pausar en hover
      marquee.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
      });
      
      marquee.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
      });
    });
  }
});