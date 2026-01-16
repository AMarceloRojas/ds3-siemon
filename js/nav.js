// navbar.js - Sistema de navegación responsive mejorado

document.addEventListener('DOMContentLoaded', async () => {
  
  // 1. CONFIGURACIÓN DE RUTAS
  const path = window.location.pathname;
  const isInProductos = path.includes('/productos/');
  const PREFIX = isInProductos ? '../' : './';
  
  console.log('📍 Ubicación detectada:', { 
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
  
  // 2. CARGA DEL NAVBAR
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
      initializeFeatures(PREFIX, PATHS);
      
      console.log('✅ Navbar cargado correctamente');
    } else {
      console.warn('⚠️ Navbar no encontrado (404)');
      createFallbackNavbar(PREFIX, PATHS);
    }
  } catch (error) {
    console.error('❌ Error cargando navbar:', error);
    createFallbackNavbar(PREFIX, PATHS);
  }

  // 3. CORRECCIÓN AUTOMÁTICA DE RUTAS
  function fixAllPaths(prefix) {
    const isExternal = (url) => {
      if (!url) return false;
      return /^(https?:\/\/|mailto:|tel:|#|data:)/i.test(url);
    };

    const fixPath = (path) => {
      if (!path || isExternal(path)) return path;
      if (path.startsWith(prefix)) return path;
      
      path = path.replace(/^\.?\/?/, '');
      
      if (path.startsWith('SIEMON/') || 
          path.startsWith('components/') || 
          path.startsWith('css/') || 
          path.startsWith('js/')) {
        return prefix + path;
      }
      return path;
    };

    // Corregir todas las imágenes
    document.querySelectorAll('img[src]').forEach(img => {
      const originalSrc = img.getAttribute('src');
      if (!isExternal(originalSrc)) {
        const fixedSrc = fixPath(originalSrc);
        if (fixedSrc !== originalSrc) {
          img.setAttribute('src', fixedSrc);
        }
      }
      
      img.loading = 'lazy';
      img.onerror = function() {
        console.warn('⚠️ Imagen no cargó:', this.src);
        this.src = prefix + 'SIEMON/icons/Siemonlogo.png';
        this.onerror = null;
      };
    });

    // Corregir todos los enlaces internos
    document.querySelectorAll('a[href]').forEach(link => {
      const originalHref = link.getAttribute('href');
      if (!isExternal(originalHref) && !originalHref.startsWith('#')) {
        const fixedHref = fixPath(originalHref);
        if (fixedHref !== originalHref) {
          link.setAttribute('href', fixedHref);
        }
      }
    });

    // Corregir hojas de estilo
    document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
      const originalHref = link.getAttribute('href');
      if (!isExternal(originalHref)) {
        const fixedHref = fixPath(originalHref);
        if (fixedHref !== originalHref) {
          link.setAttribute('href', fixedHref);
        }
      }
    });
  }

  // 4. NAVBAR DE RESPALDO (si falla la carga)
  function createFallbackNavbar(prefix, paths) {
    const fallbackHTML = `
      <nav class="bg-white w-full shadow-md border-b">
        <div class="max-w-screen-2xl mx-auto px-3 sm:px-4">
          <div class="flex justify-between items-center py-3">
            <a href="${prefix}index.html">
              <img src="${paths.logoDS3}" alt="DS3" class="h-10" />
            </a>
            <button id="mobile-menu-button" class="lg:hidden p-2 hover:bg-gray-100 rounded">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </nav>
      <div id="mobile-menu" class="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform -translate-x-full transition-transform duration-300">
        <div class="p-5 border-b flex justify-between items-center">
          <img src="${paths.logoDS3}" alt="DS3" class="h-8" />
          <button id="close-menu" class="text-gray-400 hover:text-red-500">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-500">Error cargando menú principal</p>
        </div>
      </div>
      <div id="menu-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden"></div>
    `;
    
    if (mount) {
      mount.innerHTML = fallbackHTML;
    } else {
      document.body.insertAdjacentHTML('afterbegin', fallbackHTML);
    }
    
    initializeFeatures(prefix, paths);
  }

  // 5. INICIALIZAR TODAS LAS FUNCIONALIDADES
  function initializeFeatures(prefix, paths) {
    initializeMobileMenu();
    initializeSearchModal();
    setupBrandLogos(prefix, paths);
    
    console.log('✅ Funciones inicializadas');
  }

  // 6. MENÚ LATERAL MÓVIL
  function initializeMobileMenu() {
    const btnOpen = document.getElementById('mobile-menu-button');
    const btnClose = document.getElementById('close-menu');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');

    if (!btnOpen || !menu) {
      console.warn('⚠️ Elementos del menú no encontrados');
      return;
    }

    const openMenu = () => {
      menu.classList.remove('-translate-x-full');
      overlay?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      console.log('📱 Menú abierto');
    };

    const closeMenu = () => {
      menu.classList.add('-translate-x-full');
      overlay?.classList.add('hidden');
      document.body.style.overflow = '';
      console.log('📱 Menú cerrado');
    };

    btnOpen.addEventListener('click', (e) => {
      e.stopPropagation();
      openMenu();
    });

    btnClose?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.classList.contains('-translate-x-full')) {
        closeMenu();
      }
    });

    console.log('✅ Menú móvil inicializado');
  }

  // 7. MODAL DE BÚSQUEDA (si existe)
  function initializeSearchModal() {
    const modal = document.getElementById('search-modal');
    const btnOpenDesktop = document.getElementById('search-button');
    const btnOpenMobile = document.getElementById('mobile-search-button');
    const btnClose = document.getElementById('close-search');
    const input = document.getElementById('modal-search-input');

    if (!modal) return;

    const openModal = () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input?.focus(), 100);
    };

    const closeModal = () => {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    btnOpenDesktop?.addEventListener('click', openModal);
    btnOpenMobile?.addEventListener('click', openModal);
    btnClose?.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('flex')) {
        closeModal();
      }
    });

    console.log('✅ Modal de búsqueda inicializado');
  }

  // 8. CONFIGURAR LOGOS DE MARCA DINÁMICAMENTE
  function setupBrandLogos(prefix, paths) {
    const logoDesktop = document.getElementById('product-brand-logo-desktop');
    const logoMobile = document.getElementById('product-brand-logo-mobile');
    
    if (logoDesktop) {
      logoDesktop.src = paths.logo;
      logoDesktop.onerror = function() {
        this.src = paths.logoDS3;
      };
    }
    
    if (logoMobile) {
      logoMobile.src = paths.logo;
      logoMobile.onerror = function() {
        this.src = paths.logoDS3;
      };
    }
    
    console.log('✅ Logos configurados');
  }

  // 9. GRID DE PRODUCTOS (si existe en la página)
  const grid = document.getElementById('grid');
  if (grid && typeof setupProductGrid === 'function') {
    setupProductGrid(PREFIX, PATHS);
  }

  // 10. CARRUSEL DE MARCAS (si existe en la página)
  const carousel = document.querySelector('.brand-marquee');
  if (carousel && typeof setupBrandCarousel === 'function') {
    setupBrandCarousel();
  }
});

// ===== FUNCIONES AUXILIARES GLOBALES =====

// Grid de productos (opcional, si tienes una página con grid)
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

  // Corregir imágenes del grid
  cards.forEach(card => {
    const img = card.querySelector('img');
    if (img) {
      const originalSrc = img.getAttribute('src');
      if (originalSrc && !originalSrc.startsWith('http') && !originalSrc.startsWith(prefix)) {
        img.src = prefix + originalSrc.replace(/^\.?\/?/, '');
      }
      img.loading = 'lazy';
      img.onerror = function() {
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
      return arr.sort((a, b) => (a.dataset.name || '').localeCompare(b.dataset.name || ''));
    }
    if (mode === 'model') {
      return arr.sort((a, b) => (a.dataset.model || '').localeCompare(b.dataset.model || ''));
    }
    return arr;
  };

  const render = () => {
    let list = cards.filter(c => matchFilter(c, currentFilter) && matchQuery(c, currentQuery));
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
      btnMore.style.display = list.length > PER_PAGE ? 'inline-flex' : (hasMore ? 'inline-flex' : 'none');
      if (list.length === 0) btnMore.style.display = 'none';
    }
  };

  const resetAndRender = () => {
    cursor = PER_PAGE;
    render();
  };

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

// Carrusel de marcas (opcional)
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

    marquee.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    
    marquee.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  });

  console.log('✅ Carrusel de marcas inicializado');
}