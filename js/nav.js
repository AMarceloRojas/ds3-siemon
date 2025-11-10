// /SIEMON/js/nav.js  — versión robusta con normalización de rutas
document.addEventListener('DOMContentLoaded', async () => {
  // Detecta si esta página vive dentro de /productos/
  const IN_PRODUCT = /\/productos(\/|$)/.test(location.pathname);
  const PREFIX = IN_PRODUCT ? '../' : './';         // para recursos locales
  const LOGO_FALLBACK = PREFIX + 'SIEMON/icons/Siemonlogo.png';

  // Montaje: si existe #navbar, úsalo; si no, al inicio del body
  const mount = document.querySelector('#navbar');
  const insert = (html) => {
    if (mount) mount.insertAdjacentHTML('beforeend', html);
    else document.body.insertAdjacentHTML('afterbegin', html);
  };

  // Crea una URL candidata relativa al prefijo calculado
  const make = (p) => PREFIX + p.replace(/^\.?\//, '');

  // Intenta cargar el navbar desde ubicaciones conocidas (no-file cache)
  const candidates = [
    make('components/navbar.html'),
    // por si tuvieras otra copia:
    IN_PRODUCT ? '../components/navbar.html' : './components/navbar.html',
  ];

  let loaded = false;
  for (const url of candidates) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) {
        insert(await r.text());
        fixNavbarPaths(PREFIX);  // <— importantísimo
        setupNavbar(PREFIX, LOGO_FALLBACK);
        loaded = true;
        break;
      }
    } catch (_) {}
  }

  if (!loaded) {
    console.error('No se pudo cargar components/navbar.html. Revisa la ruta o sirve por http.');
  }

  // ========================= helpers =========================
  function isExternal(u) {
    return /^https?:\/\//i.test(u) || /^data:/i.test(u) ||
           u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('#');
  }

  // Normaliza src/href del navbar ya insertado
  function fixNavbarPaths(prefix) {
    const root = (attr, el) => {
      const val = el.getAttribute(attr);
      if (!val) return;
      if (isExternal(val)) return;

      // '/algo' -> prefijo + 'algo'
      if (val.startsWith('/')) {
        el.setAttribute(attr, prefix + val.slice(1));
        return;
      }
      // './algo' -> prefijo + 'algo'
      if (val.startsWith('./')) {
        el.setAttribute(attr, prefix + val.slice(2));
        return;
      }
      // 'algo' -> prefijo + 'algo'
      el.setAttribute(attr, prefix + val);
    };

    // Corrige imágenes, enlaces, scripts y hojas de estilo internos
    document.querySelectorAll('img[src], source[src], link[rel="icon"][href], link[rel="stylesheet"][href], script[src], a[href]')
      .forEach(el => {
        if (el.hasAttribute('src')) root('src', el);
        if (el.hasAttribute('href')) root('href', el);
      });
  }

  // ===========================================================
  // Comportamiento de navbar + GRID y fallback de imágenes
  // ===========================================================
  function setupNavbar(prefix, fallbackLogo) {
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
      setTimeout(() => si?.focus(), 40);
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

    // ========================= GRID con paginación =========================
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

      // Lazy + fallback (usando prefijo correcto)
      cards.forEach(c => {
        const img = c.querySelector('img');
        if (img) {
          img.loading = 'lazy';
          img.referrerPolicy = 'no-referrer';
          img.addEventListener('error', () => {
            img.src = fallbackLogo; // p.ej. ./SIEMON/... o ../SIEMON/...
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
          btnMore.style.display = list.length > PER_PAGE ? 'inline-flex' : (hasMore ? 'inline-flex' : 'none');
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

    // ========================= Carrusel infinito de marcas =========================
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

        // Pausas
        mq.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
        mq.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
        mq.addEventListener('focusin',   () => track.style.animationPlayState = 'paused');
        mq.addEventListener('focusout',  () => track.style.animationPlayState = 'running');
      });
    })();
  }
});
