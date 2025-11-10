// /js/product.detail.js
import { PRODUCTS } from './products.siemon.js';

/* ===================== helpers ===================== */
const $ = (s) => document.querySelector(s);
const DEFAULT_IMG = '/SIEMON/icons/Siemonlogo.png';

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

/* ===================== templates con diseño simple ===================== */
function galleryTpl(imgs) {
  const list = (Array.isArray(imgs) && imgs.length ? imgs : [DEFAULT_IMG]).slice(0, 4);
  const main = list[0] || DEFAULT_IMG;

  const thumbs = list.map((src, idx) => `
    <button class="w-20 h-20 border rounded p-1 hover:border-blue-500 transition" 
            data-thumb="${src}" data-index="${idx}">
      <img src="${src}" alt="Vista ${idx + 1}" class="w-full h-full object-contain">
    </button>
  `).join('');

  return `
    <div class="bg-white rounded-lg border p-4">
      <div class="w-full h-[360px] md:h-[420px] flex items-center justify-center overflow-hidden">
        <img id="img_main" src="${main}" alt="Producto" 
             class="max-w-full max-h-full object-contain transition-opacity duration-200">
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
    // Solo 2 tipos: PDF (rojo) y Especificaciones (verde)
    let btnClass = 'download-btn btn-pdf'; // Por defecto PDF
    
    // Si el label contiene "especificaciones" o el icon es fa-clipboard-list, usar verde
    if (d.label.toLowerCase().includes('especificaciones') || 
        d.label.toLowerCase().includes('specifications') ||
        d.icon === 'fa-clipboard-list') {
      btnClass = 'download-btn btn-specs';
    }
    
    return `
      <a href="${d.href}" target="_blank" class="${btnClass}">
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

/* ===================== render principal ===================== */
function renderProduct(p) {
  // Breadcrumb
  const crumbSku = $('#crumbSku');
  if (crumbSku) crumbSku.textContent = p.sku;

  // Info block
  const infoBlock = `
    <div>
      <h1 class="text-xl md:text-2xl font-extrabold text-[#0D274D] leading-snug">
        ${escapeHtml(p.name)} — Ref. ${escapeHtml(p.sku)}
      </h1>

      <div class="mt-3">
        <a href="https://www.ds3comunicaciones.com/pedido.html" target="_blank"
           class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <i class="fa-solid fa-paper-plane"></i> Solicitar cotización
        </a>
      </div>

      ${p.summary ? `
        <ul class="mt-5 space-y-2 text-slate-700">
          <li class="flex items-start">
            <i class="fa-solid fa-circle text-[8px] mt-2 mr-2 text-[#0D274D]"></i>
            <span>${escapeHtml(p.summary)}</span>
          </li>
        </ul>
      ` : ''}

      ${p.standards && p.standards.length ? `
        <ul class="mt-3 space-y-2 text-slate-700">
          ${p.standards.slice(0, 4).map(s => `
            <li class="flex items-start">
              <i class="fa-solid fa-circle text-[8px] mt-2 mr-2 text-[#0D274D]"></i>
              <span>${escapeHtml(s)}</span>
            </li>
          `).join('')}
        </ul>
      ` : ''}
    </div>
  `;

  // Vista principal
  $('#productView').innerHTML = `
    <div class="p-4 md:p-6">
      <!-- HERO: Galería + Info -->
      <div class="grid gap-6 lg:grid-cols-2">
        ${galleryTpl(p.gallery && p.gallery.length ? p.gallery : (p.image ? [p.image] : [DEFAULT_IMG]))}
        ${infoBlock}
      </div>

      <!-- DESCRIPCIÓN -->
      ${p.description ? `
        <section class="mt-8">
          <h2 class="text-lg font-semibold mb-2">Descripción</h2>
          <p class="text-slate-700">${escapeHtml(p.description)}</p>
        </section>
      ` : ''}

      <!-- DOWNLOADS -->
      ${downloadsTpl(p.downloads)}

      <!-- ESPECIFICACIONES TÉCNICAS -->
      <section class="mt-8">
        <h2 class="text-lg font-semibold mb-3">Especificaciones Técnicas</h2>
        ${specTable(p.specs)}
      </section>

      <!-- ACORDEONES -->
      <div class="mt-8 space-y-4">
        ${p.standards && p.standards.length ? accordionTpl(
          'Normas y desempeño',
          standardsContent(p.standards),
          'fa-award'
        ) : ''}
        
        ${accordionTpl(
          'Certificaciones y ambiente',
          `
            <p><span class="font-medium">Clasificación de chaqueta:</span> ${escapeHtml(p.summary || 'Ver ficha técnica')}</p>
            <p><span class="font-medium">Cumplimiento:</span> RoHS — libre de sustancias restringidas</p>
          `,
          'fa-leaf'
        )}
      </div>
    </div>
  `;

  // Galería interactiva
  const view = $('#productView');
  const imgMain = $('#img_main');
  
  view.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-thumb]');
    if (!btn || !imgMain) return;
    imgMain.style.opacity = '0.2';
    imgMain.src = btn.getAttribute('data-thumb');
    imgMain.onload = () => imgMain.style.opacity = '1';
  });

  document.title = `SIEMON ${p.sku} • DS3`;
}

function renderSimilar(current) {
  const MAX = 6;
  const grid = document.querySelector('#similarGrid');
  if (!grid) return;

  const sameCat = PRODUCTS.filter(p => p.sku !== current.sku && p.category === current.category);
  const others = PRODUCTS.filter(p => p.sku !== current.sku && p.category !== current.category);
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
  if (uniquePool.length >= MAX) {
    cards.push(...shuffle(uniquePool).slice(0, MAX));
  } else {
    cards.push(...shuffle(uniquePool));
    while (cards.length < MAX && uniquePool.length) {
      const r = uniquePool[Math.floor(Math.random() * uniquePool.length)];
      cards.push(r);
    }
  }

  const fallbackImg = '/SIEMON/icons/Siemonlogo.png';
  const cardTpl = (p) => `
    <a href="/productos/index.html?sku=${encodeURIComponent(p.sku)}"
       class="product-card group bg-white rounded-xl shadow border hover:shadow-lg transition p-5">
      <div class="h-40 flex items-center justify-center">
        <img src="${(p.gallery && p.gallery[0]) || p.image || fallbackImg}"
             alt="${escapeHtml(p.name)}"
             class="max-h-full object-contain group-hover:scale-105 transition">
      </div>
      <div class="pt-4 text-center">
        <h3 class="font-bold">${escapeHtml(p.name)}</h3>
        <p class="text-sm text-gray-600 mt-1">Ref. ${escapeHtml(p.sku)}</p>
        <div class="mt-3 text-blue-600 font-semibold">Ver producto</div>
      </div>
    </a>
  `;

  grid.innerHTML = cards.map(cardTpl).join('');
}

/* ===================== boot ===================== */
(function boot() {
  const sku = getSku();
  const mount = $('#productView');

  console.log('[Detalle] SKU detectado:', sku);
  console.log('[Detalle] SKUs disponibles:', PRODUCTS.map(p => p.sku));

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