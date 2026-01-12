// /SIEMON/js/product.detail.js
import { PRODUCTS } from './products.siemon.js';


const path = window.location.pathname;
const isInProductos = path.includes('/productos/');
const PREFIX = isInProductos ? '../' : './';

/* ===================== UTILIDADES ===================== */
const $ = (s) => document.querySelector(s);
const DEFAULT_IMG = PREFIX + 'SIEMON/icons/Siemonlogo.png';
const WHATSAPP_PHONE = '51937514867'; // Nuevo número solicitado

function buildWhatsAppUrl(product, actionType = 'comprar') {
  const brand = product.brand || 'SIEMON';
  const currentUrl = location.href;
  
  // Mensaje dinámico según el botón presionado
  let text = actionType === 'cotizar' 
    ? `Hola, deseo cotizar el producto de la marca ${brand}, modelo ${product.sku}.` 
    : `Hola, deseo comprar el producto de la marca ${brand}, modelo ${product.sku}.`;
  
  if (product.price && actionType === 'comprar') {
    text += ` Precio: U$ ${product.price}.`;
  }
  
  text += ` Link: ${currentUrl}`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

// Normaliza rutas
const fixRel = (u) => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:')) return u;
  if (u.startsWith('/'))   return PREFIX + u.slice(1);
  if (u.startsWith('./'))  return PREFIX + u.slice(2);
  return u;
};

function escapeHtml(s) {
  return (s ?? '').toString()
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function getSku() {
  try {
    const url = new URL(location.href);
    const qs = url.searchParams.get('sku');
    if (qs) return qs;
    const parts = location.pathname.replace(/\/+$/,'').split('/');
    const last = parts[parts.length - 1];
    if (last.toLowerCase().endsWith('.html') && parts.length >= 2) {
      return parts[parts.length - 2];
    }
  } catch {}
  return null;
}

function galleryTpl(imgs) {
  const listRaw = (Array.isArray(imgs) && imgs.length ? imgs : [DEFAULT_IMG]).slice(0, 4);
  const list = listRaw.map(fixRel);
  const main = list[0] || DEFAULT_IMG;

  const thumbs = list.map((src, idx) => `
    <button class="w-20 h-20 border rounded p-1 hover:border-blue-500 transition bg-white" 
            data-thumb="${src}" data-index="${idx}">
      <img src="${src}" class="w-full h-full object-contain" onerror="this.src='${DEFAULT_IMG}'">
    </button>
  `).join('');

  return `
    <div class="w-full">
      <div class="w-full h-[360px] md:h-[420px] flex items-center justify-center overflow-hidden">
        <img id="img_main" src="${main}" alt="Producto" 
             class="max-w-full max-h-full object-contain transition-opacity duration-200 cursor-zoom-in"
             onerror="this.src='${DEFAULT_IMG}'">
      </div>
      <div class="flex gap-3 mt-4 justify-center">${thumbs}</div>
    </div>
  `;
}

function specTable(specs) {
  if (!specs || typeof specs !== 'object') return '';
  const entries = Object.entries(specs);
  if (!entries.length) return '';
  
  const rows = entries.map(([k, v], i) => `
    <tr class="${i % 2 === 0 ? '' : 'bg-gray-50'}">
      <th class="text-left font-semibold px-3 py-2 w-60">${escapeHtml(k)}</th>
      <td class="px-3 py-2">${escapeHtml(v)}</td>
    </tr>
  `).join('');
  
  return `
    <div class="overflow-x-auto border rounded-lg">
      <table class="min-w-[560px] w-full text-sm">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function downloadsTpl(items) {
  if (!Array.isArray(items) || !items.length) return '';
  
  const links = items.map(d => {
    const href = fixRel(d.href);
    let btnClass = 'download-btn btn-pdf';
    if ((d.label || '').toLowerCase().includes('especificaciones') ||
        (d.label || '').toLowerCase().includes('specifications') ||
        d.icon === 'fa-clipboard-list') {
      btnClass = 'download-btn btn-specs';
    }
    return `
      <a href="${href}" target="_blank" class="${btnClass}">
        <i class="fa-solid ${d.icon || 'fa-file-pdf'}"></i>
        <span>${escapeHtml(d.label || 'Descarga')}</span>
      </a>
    `;
  }).join('');
  
  return `
    <section class="mt-6">
      <h3 class="font-semibold text-lg mb-3">Download</h3>
      <div class="flex flex-wrap gap-3">${links}</div>
    </section>
  `;
}

function accordionTpl(title, content, icon = 'fa-certificate') {
  if (!content) return '';
  return `
    <details class="acc group">
      <summary class="acc-sum">
        <span class="flex items-center gap-2">
          <i class="fa-solid ${icon} text-blue-600"></i>
          ${title}
        </span>
        <i class="fa-solid fa-angle-right text-blue-600 group-open:rotate-90 transition-transform"></i>
      </summary>
      <div class="acc-body">${content}</div>
    </details>
  `;
}

function standardsContent(items) {
  if (!Array.isArray(items) || !items.length) return '';
  return `
    <div class="grid md:grid-cols-2 gap-3">
      ${items.map(t => `<p>${escapeHtml(t)}</p>`).join('')}
    </div>
  `;
}

/* ===================== render ===================== */
function renderProduct(p) {
  // Breadcrumb
  const crumbSku = $('#crumbSku');
  if (crumbSku) crumbSku.textContent = p.sku;

  // Info block con PRECIO y BOTÓN DE COMPRA (estilo imagen azul)
  

  const infoBlock = `
  <div class="text-slate-700 w-full">
    <div class="border p-5 rounded-md bg-white shadow-sm">
      <h1 class="font-medium mb-3 text-lg md:text-xl">
        ${escapeHtml(p.name)} — Ref. ${escapeHtml(p.sku)}
      </h1>
      
      <ul class="text-sm text-slate-500 mb-4 space-y-1">
        <li>- Rollo de 305 metros</li>
        <li>- Cable F/UTP sólido de 04 pares Cat 5e</li>
        <li>- Chaqueta PVC (CM, IEC 60332-1)</li>
        <li>- Color gris</li>
        <li>- ANSI/TIA-568.2-D — Cat 5e</li>
        <li>- IEC 60332-1</li>
        <li>- Aplicaciones: 10/100/1000BASE-T</li>
        <li>- RoHS Compliant</li>
      </ul>

      <div class="mt-3 flex gap-2 justify-between items-center border-t pt-4">
          <span class="font-bold text-lg text-slate-800">$ ${p.price || '0.00'} + IGV</span>
          
          <a href="${buildWhatsAppUrl(p, 'comprar')}" target="_blank"
             class="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 text-sm font-medium border rounded-md px-3 py-2 transition duration-200">
             <i class="fa-solid fa-cart-shopping"></i>
             <span>Comprar</span>
          </a>
      </div>

      <div class="mt-2">
          <a href="${buildWhatsAppUrl(p, 'cotizar')}" target="_blank"
             class="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 text-sm font-medium border rounded-md px-3 py-2 transition duration-200">
             <i class="fa-solid fa-file-lines"></i>
             <span>Cotizar</span>
          </a>
      </div>
    </div>

    <div class="mt-4 flex flex-col items-start gap-2">
        <span class="text-blue-600 font-bold text-sm uppercase">Download</span>
        ${(p.downloads || []).map(d => `
          <a href="${fixRel(d.href)}" target="_blank" class="text-sm font-medium border rounded-md px-3 py-2 hover:bg-gray-100 flex items-center gap-2 transition w-full md:w-auto">
            <i class="fa-solid fa-download"></i> 
            ${escapeHtml(d.label)}
          </a>
        `).join('')}
    </div>
  </div>
  `;

  // Galería + info
  $('#productView').innerHTML = `
    <div class="p-4 md:p-6">
      <div class="flex flex-col lg:flex-row-reverse gap-8 items-start">
        
        <div class="w-full lg:w-1/2">
          ${galleryTpl(p.gallery && p.gallery.length ? p.gallery : (p.image ? [p.image] : [DEFAULT_IMG]))}
        </div>

        <div class="w-full lg:w-1/2">
          ${infoBlock}
        </div>

      </div>

      ${p.description ? `
        <section class="mt-8">
          <h2 class="text-lg font-semibold mb-2">Descripción</h2>
          <p class="text-slate-700">${escapeHtml(p.description)}</p>
        </section>
      ` : ''}

      

      <div class="mt-8 space-y-4">

      ${accordionTpl(
        'Especificaciones técnicas',
        specTable(p.specs),
        'fa-table-list'
      )}

      ${p.standards && p.standards.length ? accordionTpl(
        'Normas y desempeño',
        standardsContent(p.standards),
        'fa-award'
      ) : ''}

      ${accordionTpl(
        'Certificaciones y ambiente',
        `
          <p><span class="font-medium">Clasificación de chaqueta:</span> ${escapeHtml(p.summary ? p.summary[2] : 'Ver ficha técnica')}</p>
          <p><span class="font-medium">Cumplimiento:</span> RoHS — libre de sustancias restringidas</p>
        `,
        'fa-leaf'
      )}

    </div>
  `;

  
  const btnComprar = document.getElementById('btnComprar');

  // Botón "Comprar ahora" - con precio (cantidad fija = 1)
  if (btnComprar && p.price) {
    btnComprar.addEventListener('click', (e) => {
      e.preventDefault();
      const qty = 1; // Cantidad fija
      const waUrl = buildWhatsAppUrl(p, qty, true); // true = incluir precio
      window.open(waUrl, '_blank');
    });
  }

  
  const imgMain = $('#img_main');
  if (imgMain) imgMain.addEventListener('error', () => { imgMain.src = DEFAULT_IMG; }, { once:true });

  
  const view = $('#productView');
  view.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-thumb]');
    if (!btn || !imgMain) return;
    imgMain.style.opacity = '0.2';
    imgMain.src = fixRel(btn.getAttribute('data-thumb'));
    imgMain.onload = () => imgMain.style.opacity = '1';
  });

  document.title = `SIEMON ${p.sku} • DS3`;
}


function renderSimilar(current) {
  const MAX = 6;
  const grid = document.querySelector('#similarGrid');
  if (!grid) return;

  const sameCat = PRODUCTS.filter(p => p.sku !== current.sku && p.category === current.category);
  const others  = PRODUCTS.filter(p => p.sku !== current.sku && p.category !== current.category);
  const uniquePool = [...sameCat, ...others];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const cards = [];
  if (uniquePool.length >= MAX) cards.push(...shuffle(uniquePool).slice(0, MAX));
  else {
    cards.push(...shuffle(uniquePool));
    while (cards.length < MAX && uniquePool.length) {
      const r = uniquePool[Math.floor(Math.random() * uniquePool.length)];
      cards.push(r);
    }
  }

  const cardTpl = (p) => {
    const imgSrc = fixRel((p.gallery && p.gallery[0]) || p.image) || DEFAULT_IMG;
    return `
      <a href="./index.html?sku=${encodeURIComponent(p.sku)}"
         class="product-card group bg-white rounded-xl shadow border hover:shadow-lg transition p-5">
        <div class="h-40 flex items-center justify-center">
          <img src="${imgSrc}"
               alt="${escapeHtml(p.name)}"
               class="max-h-full object-contain group-hover:scale-105 transition"
               loading="lazy"
               onerror="this.src='${DEFAULT_IMG}'">
        </div>
        <div class="pt-4 text-center">
          <h3 class="font-bold">${escapeHtml(p.name)}</h3>
          <p class="text-sm text-gray-600 mt-1">Ref. ${escapeHtml(p.sku)}</p>
          <div class="mt-3 text-blue-600 font-semibold">Ver producto</div>
        </div>
      </a>
    `;
  };

  grid.innerHTML = cards.map(cardTpl).join('');
}


(function boot() {
  const sku = getSku();
  const mount = $('#productView');

  if (!sku) {
    mount.innerHTML = `<div class="p-6 bg-white border rounded-xl">No encontré el producto (sin SKU).</div>`;
    return;
  }

  const product = PRODUCTS.find(p => p.sku === sku);
  if (!product) {
    mount.innerHTML = `<div class="p-6 bg-white border rounded-xl">No encontré el producto (${escapeHtml(sku)}).</div>`;
    return;
  }

  renderProduct(product);
  renderSimilar(product);
})();
// --- ZOOM MODAL PRO (mejora visual + UX) ---
(function setupZoom() {
  if (document.getElementById('zoomContainer')) return;

  const zoomDiv = document.createElement('div');
  zoomDiv.id = 'zoomContainer';
  zoomDiv.className = `
    fixed inset-0 z-[100] hidden
    bg-black/70 backdrop-blur-sm
    flex items-center justify-center p-4
  `;

  zoomDiv.innerHTML = `
    <div id="zoomPanel"
      class="
        relative w-full max-w-6xl
        rounded-2xl overflow-hidden
        shadow-2xl ring-1 ring-white/10
        bg-gradient-to-b from-white/5 to-white/0
        transform transition duration-200 ease-out scale-95 opacity-0
      "
    >
      <button id="zoomClose"
        class="
          absolute top-3 right-3 z-10
          w-11 h-11 rounded-full
          bg-black/50 hover:bg-black/70
          text-white text-2xl leading-none
          flex items-center justify-center
          transition
        "
        aria-label="Cerrar"
      >&times;</button>

      <div class="p-3 md:p-5">
        <div class="w-full h-[70vh] flex items-center justify-center">
          <img id="zoomImg"
            src=""
            class="
              max-w-full max-h-full object-contain
              rounded-xl
              shadow-lg
              select-none
            "
            alt="Zoom"
            draggable="false"
          />
        </div>

        <p class="mt-3 text-center text-white/70 text-sm">
          Click fuera o ESC para cerrar
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(zoomDiv);

  const zoomPanel = zoomDiv.querySelector('#zoomPanel');
  const zoomImg = zoomDiv.querySelector('#zoomImg');
  const closeBtn = zoomDiv.querySelector('#zoomClose');

  function openZoom(src) {
    zoomImg.src = src;
    zoomDiv.classList.remove('hidden');

    // animación
    requestAnimationFrame(() => {
      zoomPanel.classList.remove('scale-95', 'opacity-0');
      zoomPanel.classList.add('scale-100', 'opacity-100');
    });
  }

  function closeZoom() {
    zoomPanel.classList.remove('scale-100', 'opacity-100');
    zoomPanel.classList.add('scale-95', 'opacity-0');

    setTimeout(() => zoomDiv.classList.add('hidden'), 150);
  }

  // cerrar si haces click fuera del panel
  zoomDiv.addEventListener('click', (e) => {
    if (e.target === zoomDiv) closeZoom();
  });

  // no cerrar si haces click dentro del panel
  zoomPanel.addEventListener('click', (e) => e.stopPropagation());

  closeBtn.addEventListener('click', closeZoom);

  document.addEventListener('keydown', (e) => {
    if (!zoomDiv.classList.contains('hidden') && e.key === 'Escape') closeZoom();
  });


  document.addEventListener('click', (e) => {
    const imgMain = e.target.closest('#img_main');
    if (!imgMain) return;
    openZoom(imgMain.src);
  });
})();
