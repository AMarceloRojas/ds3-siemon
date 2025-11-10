// /SIEMON/js/nav.js
document.addEventListener('DOMContentLoaded', async () => {
  // Dónde montar el navbar: si existe #navbar úsalo, si no, al inicio del body
  const mount = document.querySelector('#navbar');
  const insert = (html) => {
    if (mount) {
      mount.insertAdjacentHTML('beforeend', html);
    } else {
      document.body.insertAdjacentHTML('afterbegin', html);
    }
  };

  // Candidatos de ruta (mismo nivel hasta 4 niveles arriba)
  const here = location.pathname.replace(/\/[^\/]*$/, '/');
  const ups  = ['', '../', '../../', '../../../', '../../../../'];
  const candidates = ups.map(up => here + up + 'components/navbar.html');

  for (const url of candidates) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) {
        insert(await r.text());
        setupNavbar();
        return;
      }
    } catch (_) {}
  }
  console.error('No se pudo cargar components/navbar.html. Revisa la ruta o usa un servidor (no file://).');
});

function setupNavbar() {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Offcanvas
  const off = $('#offcanvas');
  $$('#btnMenu').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    off?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }));
  $$('#btnCloseMenu').forEach(b => b.addEventListener('click', () => {
    off?.classList.add('hidden');
    document.body.style.overflow = '';
  }));
  off?.addEventListener('click', e => {
    if (e.target === off) {
      off.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  // Buscador
  const sp = $('#searchPanel'), si = $('#searchInput');
  $$('#btnSearch').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    sp?.classList.remove('hidden');
    setTimeout(() => si?.focus(), 50);
  }));
  $('#btnCloseSearch')?.addEventListener('click', () => sp?.classList.add('hidden'));
  sp?.addEventListener('click', e => { if (e.target === sp) sp.classList.add('hidden'); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      sp?.classList.add('hidden');
      off?.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });
}

/* =========================
   GRID con paginación "ver más"
   ========================= */
(() => {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const PER_PAGE = 6;
  let currentFilter = 'all';
  let currentQuery  = '';
  let currentSort   = '';
  let cursor        = PER_PAGE;

  const cards  = Array.from(grid.querySelectorAll('.card'));
  const chips  = Array.from(document.querySelectorAll('[data-filter]'));
  const inputQ = document.getElementById('q');
  const selSort= document.getElementById('sort');
  const btnMore= document.getElementById('btnMore');
  const cnt    = document.getElementById('countVisible');

  // Lazy loading de imágenes con fallback
  cards.forEach(c => {
    const img = c.querySelector('img');
    if (img) {
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', () => {
        img.src = '/SIEMON/icons/Siemonlogo.png';
      });
    }
  });

  const matchFilter = (card, filter) => {
    if (filter === 'all') return true;
    const cat = (card.dataset.cat || '').toLowerCase();
    if (filter === 'jack')  return cat.startsWith('jack');
    if (filter === 'patch') return cat.startsWith('patch');
    return cat === filter;
  };

  const matchQuery = (card, q) => {
    if (!q) return true;
    const name  = (card.dataset.name  || '').toLowerCase();
    const model = (card.dataset.model || '').toLowerCase();
    return name.includes(q) || model.includes(q);
  };

  const sortCards = (arr, mode) => {
    if (mode === 'name')  return arr.sort((a,b)=> (a.dataset.name||'').localeCompare(b.dataset.name||''));
    if (mode === 'model') return arr.sort((a,b)=> (a.dataset.model||'').localeCompare(b.dataset.model||''));
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

    cnt && (cnt.textContent = String(list.length));
    const hasMore = cursor < list.length;
    if (btnMore) {
      btnMore.disabled = !hasMore;
      btnMore.style.display = list.length > PER_PAGE ? 'inline-flex' : (hasMore ? 'inline-flex':'none');
      if (list.length === 0) btnMore.style.display = 'none';
    }
  };

  const resetAndRender = () => { cursor = PER_PAGE; render(); };

  chips.forEach(ch => {
    ch.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('active'));
      ch.classList.add('active');
      currentFilter = ch.dataset.filter || 'all';
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
})();

/* Carrusel infinito de marcas */
(() => {
  const marquees = document.querySelectorAll('.brand-marquee');
  marquees.forEach(mq => {
    const track = mq.querySelector('.brand-track');
    if (!track) return;

    // Clonar contenido para bucle continuo
    const clones = Array.from(track.children).map(n => n.cloneNode(true));
    track.append(...clones);

    // Duración dinámica según cantidad y velocidad
    const items = track.children.length / 2;
    const speed = parseFloat(mq.dataset.speed || '2');
    const base  = Math.max(14, items * 2.2);
    const dur   = Math.max(10, base / speed);
    track.style.setProperty('--dur', dur + 's');

    // Pausar con mouse/teclado
    mq.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    mq.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    mq.addEventListener('focusin',   () => track.style.animationPlayState = 'paused');
    mq.addEventListener('focusout',  () => track.style.animationPlayState = 'running');
  });
})();
// gallery.js - Sistema de galería de imágenes para páginas de producto

document.addEventListener('DOMContentLoaded', () => {
  const mainImg = document.getElementById('img_main');
  
  if (!mainImg) {
    console.log('No hay galería en esta página');
    return;
  }

  const thumbs = document.querySelectorAll('[data-gallery-thumb]');
  
  if (thumbs.length === 0) {
    console.warn('No se encontraron miniaturas con data-gallery-thumb');
    return;
  }

  console.log(`✓ Galería detectada: ${thumbs.length} miniaturas encontradas`);

  // Si la imagen principal está vacía, cargar la primera miniatura
  if (!mainImg.src || mainImg.src.endsWith('/') || mainImg.getAttribute('src') === '') {
    const firstThumb = thumbs[0];
    if (firstThumb?.dataset.galleryThumb) {
      mainImg.src = firstThumb.dataset.galleryThumb;
      console.log('Imagen inicial cargada:', firstThumb.dataset.galleryThumb);
    }
  }

  // Añadir evento click a cada miniatura
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', function(e) {
      e.preventDefault();
      
      const newSrc = this.dataset.galleryThumb;
      
      if (!newSrc) {
        console.error('Miniatura sin data-gallery-thumb');
        return;
      }

      console.log(`Click en miniatura ${index + 1}: ${newSrc}`);
      
      // Efecto fade
      mainImg.style.transition = 'opacity 0.2s ease';
      mainImg.style.opacity = '0.5';
      
      setTimeout(() => {
        mainImg.src = newSrc;
        mainImg.style.opacity = '1';
      }, 150);

      // Marcar thumbnail activo visualmente
      thumbs.forEach(t => {
        t.classList.remove('ring-2', 'ring-blue-500', 'border-blue-500');
        t.classList.add('border-gray-300');
      });
      
      this.classList.remove('border-gray-300');
      this.classList.add('ring-2', 'ring-blue-500', 'border-blue-500');
    });
  });

  // Marcar la primera como activa por defecto
  if (thumbs[0]) {
    thumbs[0].classList.add('ring-2', 'ring-blue-500', 'border-blue-500');
  }

  console.log('✓ Sistema de galería inicializado correctamente');
});
