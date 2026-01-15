// /SIEMON/js/product.detail.js
import { PRODUCTS } from './products.siemon.js';


const path = window.location.pathname;
const isInProductos = path.includes('/productos/');
const PREFIX = isInProductos ? '../' : './';
const FAQ_WHATSAPP = '51937700700'; // el número que te pidieron para FAQ

function faqTpl(p) {
  const faq = Array.isArray(p.faq) ? p.faq : [];
  if (!faq.length) return '';

  const title = p.faqTitle || `Preguntas Frecuentes sobre ${p.sku || 'este producto'}`;

  const items = faq.map((it, idx) => `
    <div class="faq-item mb-4 border rounded-xl overflow-hidden">
      <button type="button"
        class="faq-question w-full text-left px-5 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
        aria-expanded="false"
        data-faq-index="${idx}">
        <span class="font-semibold text-gray-800">${escapeHtml(it.q)}</span>
        <i class="fas fa-chevron-down transition-transform duration-300"></i>
      </button>

      <div class="faq-answer px-5 py-4 bg-white hidden">
        <p class="text-gray-700 leading-relaxed">${escapeHtml(it.a)}</p>
      </div>
    </div>
  `).join('');

  // Mensaje WhatsApp dinámico (incluye producto)
  const msg = `Hola, tengo una consulta sobre el producto ${p.brand || 'SIEMON'} ${p.sku}: `;
  const waLink = `https://wa.me/${FAQ_WHATSAPP}?text=${encodeURIComponent(msg)}`;

  return `
    <section class="faq-section mx-auto mt-10 mb-10 max-w-4xl">
      <div class="border rounded-2xl p-6 bg-white shadow-sm">
        <h2 class="text-2xl font-extrabold text-center mb-6 text-slate-900">
          <i class="fas fa-question-circle mr-2 text-blue-600"></i>
          ${escapeHtml(title)}
        </h2>

        <div class="faq-container">
          ${items}

          <div class="new-question mt-8 p-6 border border-blue-200 rounded-2xl bg-blue-50">
            <h3 class="text-xl font-bold mb-2 text-blue-700">
              ¿Tienes otra pregunta sobre ${escapeHtml(p.sku)}?
            </h3>
            <p class="text-gray-700 mb-4">
              Escríbenos por WhatsApp y te respondemos.
            </p>

            <div class="flex flex-col sm:flex-row gap-3">
              <a href="${waLink}" target="_blank"
                 class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2">
                <i class="fab fa-whatsapp text-lg"></i>
                Enviar pregunta por WhatsApp
              </a>
            </div>

            <p class="text-xs text-gray-500 text-center mt-3">
              Al hacer clic se abrirá WhatsApp con el mensaje pre-escrito.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

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
// Supongamos que 'product' es el objeto que pusiste de ejemplo
const renderCard = (product) => {
  return `
    <div class="group relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
      
      <div class="flex flex-col items-center text-center">
        <div class="h-40 flex items-center justify-center mb-4">
          <img src="${product.gallery[0]}" alt="${product.name}" class="max-h-full object-contain">
        </div>
        <h3 class="text-sm font-bold text-slate-800 mb-1 h-10 overflow-hidden line-clamp-2">
          ${product.name}
        </h3>
        <p class="text-xs text-gray-500 mb-3">Ref. ${product.sku}</p>
        <span class="text-blue-600 font-semibold text-sm">Ver producto</span>
      </div>

      <div class="absolute inset-0 bg-white/98 p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col border-2 border-blue-500 rounded-xl">
        <div class="flex justify-between items-start mb-2">
          <h4 class="text-xs font-bold text-blue-700 uppercase tracking-wider">${product.sku}</h4>
          <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">STOCK DISPONIBLE</span>
        </div>
        
        <div class="mb-3">
          <p class="text-xl font-bold text-slate-900">$${product.price.toFixed(2)} <span class="text-xs text-gray-500 font-normal">+ IGV</span></p>
        </div>

        <div class="flex-1 overflow-y-auto custom-scroll pr-1">
          <ul class="space-y-1.5">
            ${product.summary.map(item => `
              <li class="flex items-start gap-2 text-[11px] text-slate-600">
                <i class="fa-solid fa-check text-blue-500 mt-0.5"></i>
                <span>${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100">
           <a href="product.html?sku=${product.sku}" class="block w-full text-center bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
              VER DETALLES
           </a>
        </div>
      </div>

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
          <span class="text-3xl font-extrabold text-slate-600">
      $ ${p.price || '0.00'} + IGV 
    </span>
          
          <a href="${buildWhatsAppUrl(p, 'comprar')}" target="_blank"
   class="
     bg-blue-600 hover:bg-blue-700
     text-white
     flex items-center gap-2
     text-base lg:text-lg font-semibold
     border
     rounded-xl
     px-6 py-4
     transition
     shadow-md hover:shadow-lg
   ">
   <i class="fa-solid fa-cart-shopping text-lg"></i>
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

      <div class="flex justify-center border-b mt-6">
          <ul class="flex gap-4 mb-[-2px]">
              <li id="btn-show-info" 
                  onclick="window.changeProductTab('info')"
                  class="cursor-pointer px-8 py-3 border-b-2 border-blue-600 text-blue-600 font-bold text-sm transition-all uppercase">
                  Producto
              </li>
              <li id="btn-show-gallery" 
                  onclick="window.changeProductTab('gallery')"
                  class="cursor-pointer px-8 py-3 border-b-2 border-transparent text-gray-500 hover:text-blue-600 font-bold text-sm transition-all uppercase">
                  Imágenes
              </li>
          </ul>
      </div>

      <div class="mt-8 relative">
          
          <div id="tab-info-content" style="display: block;">
              ${p.description ? `
                <section class="mb-10">
                  <h2 class="text-xl font-bold mb-3 text-slate-800">Descripción</h2>
                  <p class="text-slate-700 leading-relaxed text-base">${escapeHtml(p.description)}</p>
                </section>
              ` : ''}

              <div class="space-y-4">
                  ${accordionTpl('Especificaciones técnicas', specTable(p.specs), 'fa-table-list')}
                  ${p.standards && p.standards.length ? accordionTpl('Normas y desempeño', standardsContent(p.standards), 'fa-award') : ''}
                  ${accordionTpl('Certificaciones y ambiente', `
                      <p class="text-sm"><span class="font-bold">Clasificación de chaqueta:</span> ${p.summary ? escapeHtml(p.summary[2]) : 'Ver ficha técnica'}</p>
                      <p class="text-sm mt-1"><span class="font-bold">Cumplimiento:</span> RoHS</p>
                  `, 'fa-leaf')}
              </div>
          </div>

          <div id="tab-gallery-content" style="display: none;">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  ${(p.gallery || []).map(img => `
                      <div class="border border-gray-200 rounded-xl overflow-hidden h-60 bg-white flex items-center justify-center p-3 shadow-sm hover:shadow-md transition-all">
                          <img src="${fixRel(img)}" class="max-h-full max-w-full object-contain">
                      </div>
                  `).join('')}
              </div>
          </div>

      </div>
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
  if (uniquePool.length >= MAX) {
    cards.push(...shuffle(uniquePool).slice(0, MAX));
  } else {
    cards.push(...shuffle(uniquePool));
    while (cards.length < MAX && uniquePool.length) {
      const r = uniquePool[Math.floor(Math.random() * uniquePool.length)];
      cards.push(r);
    }
  }

  const cardTpl = (p) => {
  const imgSrc = fixRel((p.gallery && p.gallery[0]) || p.image) || DEFAULT_IMG;
  const price = p.price ? `$${p.price.toFixed(2)}` : 'Consultar';
  const hasSummary = Array.isArray(p.summary) && p.summary.length > 0;
  
  // Si estamos en /productos/, recargar mismo index.html
  // Si estamos en raíz, ir a /productos/index.html
  const productUrl = isInProductos 
    ? `./index.html?sku=${encodeURIComponent(p.sku)}` 
    : `./productos/index.html?sku=${encodeURIComponent(p.sku)}`;
  
  return `
    <a href="${productUrl}" 
       class="group relative bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden block">
      
      <div class="flex flex-col items-center text-center space-y-3">
        <div class="h-44 flex items-center justify-center p-2">
          <img src="${imgSrc}" 
               alt="${escapeHtml(p.name)}" 
               class="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
               loading="lazy"
               onerror="this.src='${DEFAULT_IMG}'">
        </div>
        <div class="space-y-1 w-full">
          <h3 class="text-sm font-bold text-slate-800 line-clamp-2 min-h-[40px] px-2">
            ${escapeHtml(p.name)}
          </h3>
          <p class="text-xs text-gray-400 font-medium tracking-wide">Ref. ${p.sku}</p>
          
          <!-- PRECIO VISIBLE SIEMPRE -->
          <div class="pt-2 border-t border-gray-100 mt-2">
            <p class="text-lg font-black text-blue-600">
              ${price}
              ${p.price ? '<span class="text-[10px] text-gray-500 font-normal ml-1">+ IGV</span>' : ''}
            </p>
          </div>
        </div>
        
      </div>

      <div class="absolute inset-0 bg-white/98 p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col translate-y-4 group-hover:translate-y-0 border-2 border-blue-500 rounded-xl">
        
        <div class="flex justify-between items-start mb-4">
          <div class="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-1 rounded">DISPONIBLE</div>
          <p class="text-xl font-black text-slate-900 leading-none">
            ${price}<span class="text-[10px] text-gray-500 font-normal ml-1">${p.price ? '+ IGV' : ''}</span>
          </p>
        </div>

        ${hasSummary ? `
        <div class="flex-1 overflow-y-auto mb-4" style="scrollbar-width: thin; scrollbar-color: #888 #f1f1f1;">
          <ul class="space-y-2">
            ${p.summary.map(point => `
              <li class="flex items-start gap-2 text-[11px] leading-tight text-slate-600">
                <i class="fa-solid fa-circle-check text-blue-500 mt-0.5"></i>
                <span>${escapeHtml(point)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : `
        <div class="flex-1 flex items-center justify-center mb-4">
          <p class="text-sm text-gray-500 italic">Ver detalles del producto</p>
        </div>
        `}

        <div class="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-3 rounded-lg transition-colors text-center shadow-md">
          MÁS INFORMACIÓN
        </div>
      </div>

    </a>
  `;
};

  grid.innerHTML = cards.map(cardTpl).join('');
}
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
document.addEventListener('DOMContentLoaded', () => {
  initFAQAccordion();
  initWhatsAppQuestionForm();
});

function initFAQAccordion() {
  const questions = document.querySelectorAll('.faq-question');

  questions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling; // .faq-answer
      const icon = btn.querySelector('i');

      // Cerrar todas las demás
      document.querySelectorAll('.faq-answer').forEach((other) => {
        if (other !== answer) {
          other.classList.add('hidden');
          const otherIcon = other.previousElementSibling?.querySelector('i');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle actual
      const willOpen = answer.classList.contains('hidden');
      answer.classList.toggle('hidden', !willOpen);

      if (icon) icon.style.transform = willOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  });
}

// --- WhatsApp form (tu misma lógica, solo la dejo viva y estable) ---
function initWhatsAppQuestionForm() {
  const textarea = document.getElementById('user-question');
  const whatsappBtn = document.getElementById('whatsapp-question-btn');
  const charCount = document.getElementById('char-count');
  const maxChars = 500;

  if (!textarea || !whatsappBtn || !charCount) return;

  const phoneNumber = '937700700';

  textarea.addEventListener('input', function () {
    let currentLength = this.value.length;

    if (currentLength > maxChars) {
      this.value = this.value.substring(0, maxChars);
      currentLength = maxChars;
    }

    charCount.textContent = `${currentLength}/${maxChars}`;

    if (currentLength > maxChars * 0.9) {
      charCount.classList.add('text-red-600', 'font-medium');
      charCount.classList.remove('text-gray-500');
    } else {
      charCount.classList.remove('text-red-600', 'font-medium');
      charCount.classList.add('text-gray-500');
    }

    const ok = this.value.trim().length > 0 && this.value.trim().length <= maxChars;
    whatsappBtn.disabled = !ok;
  });

  whatsappBtn.addEventListener('click', () => {
    const question = textarea.value.trim();
    if (!question) return;

    const message =
      `*Consulta sobre U7-LITE*\n\n` +
      `Hola, tengo la siguiente pregunta:\n\n${question}\n\n` +
      `Producto: U7-LITE Access Point WiFi 7`;

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');

    // reset UI
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
  });

  // inicializa estado
  textarea.dispatchEvent(new Event('input'));
}

// --- Facebook comments refresh (opcional, pero si lo quieres) ---
window.addEventListener('load', () => {
  setTimeout(() => {
    if (typeof FB !== 'undefined') FB.XFBML.parse();
  }, 600);
});
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
  initFAQAccordion(document); // ✅ IMPORTANTE: después del render
  renderSimilar(product);
})();
// 1. Función para encontrar el producto actual y renderizar
function initProductTemplate() {
    const urlParams = new URLSearchParams(window.location.search);
    const productSku = urlParams.get('sku');

    // Buscamos el objeto dentro de tu array PRODUCTS
    const productoActual = PRODUCTS.find(p => p.sku === productSku);

    if (productoActual) {
        renderProductoFAQ(productoActual);
    } else {
        // Carga el primero por defecto si no hay SKU en la URL para que no quede vacío
        if (PRODUCTS.length > 0) renderProductoFAQ(PRODUCTS[0]); 
    }
}

// 2. La función que construye el HTML con el RECTÁNGULO de texto
function renderProductoFAQ(producto) {
    const container = document.getElementById('dynamic-faq-container');
    if (!container) return;

    const faqItemsHTML = producto.faq.map((item) => `
        <div class="faq-item mb-4 border rounded-md overflow-hidden">
            <button class="faq-question w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center" 
                    onclick="toggleFaq(this)">
                <span class="font-medium text-gray-800">${item.q}</span>
                <i class="fas fa-chevron-down transition-transform duration-300"></i>
            </button>
            <div class="faq-answer p-4 bg-white hidden border-t">
                <p class="text-gray-700">${item.a}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <section class="faq-section mx-auto mt-10 mb-10" style="max-width: 90%; width: 900px">
            <div class="border rounded-md p-5 bg-white shadow-sm">
                <h2 class="text-2xl font-bold text-center mb-6 text-blue-600">
                    <i class="fas fa-question-circle mr-2"></i>
                    ${producto.faqTitle || `Preguntas Frecuentes sobre ${producto.sku}`}
                </h2>
                
                <div class="faq-container">
                    ${faqItemsHTML}
                </div>

                <div class="new-question mt-8 p-6 border border-blue-200 rounded-lg bg-blue-50">
                    <h3 class="text-xl font-bold mb-2 text-blue-700">
                        ¿Tienes otra pregunta sobre el ${producto.sku}?
                    </h3>
                    <p class="text-gray-700 mb-4">Envíanos tu consulta y nuestro equipo técnico te responderá en menos de 24 horas.</p>
                    
                    <div class="mb-4">
                        <textarea 
                            id="user-msg-${producto.sku}" 
                            placeholder="Ejemplo: ¿Tienen stock disponible? ¿Viene con garantía? ¿Hacen envíos a provincia?"
                            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            rows="4"
                            maxlength="500"
                            oninput="updateCharCount(this, '${producto.sku}')"
                        ></textarea>
                        <div class="mt-1 text-sm text-gray-500 flex justify-between">
                            <span>Escribe tu pregunta específica sobre el producto</span>
                            <span><span id="char-count-${producto.sku}">0</span>/500</span>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3">
                        <button 
                            onclick="enviarWSP('${producto.sku}', '${producto.name}')"
                            class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition duration-200 flex items-center justify-center gap-2"
                        >
                            <i class="fab fa-whatsapp"></i>
                            Enviar pregunta por WhatsApp
                        </button>
                        <a 
                            href="https://wa.me/51937700700?text=Hola, tengo una consulta general" 
                            target="_blank"
                            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-200 flex items-center justify-center gap-2"
                        >
                            <i class="fas fa-comments"></i>
                            Consulta general
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 text-center mt-4">
                        <i class="fas fa-info-circle mr-1"></i>
                        Al hacer clic en "Enviar pregunta por WhatsApp", se abrirá WhatsApp con tu pregunta pre-escrita.
                    </p>
                </div>
            </div>
        </section>

        <section class="fb-comments-section mx-auto mb-10" style="max-width: 90%; width: 900px">
            <div class="border rounded-md p-5 bg-white shadow-sm">
                <h3 class="text-2xl font-bold text-center mb-6 text-blue-700">
                    <i class="fab fa-facebook mr-2"></i>
                    Opiniones sobre ${producto.sku}
                </h3>
                <div class="fb-comments" 
                     data-href="https://www.ds3comunicaciones.com/producto/${producto.sku}" 
                     data-width="100%" 
                     data-numposts="5">
                </div>
            </div>
        </section>
    `;

    if (window.FB) window.FB.XFBML.parse();
}

// --- FUNCIONES LÓGICAS ---

// 1. Envío a WhatsApp capturando el texto del rectángulo
function enviarWSP(sku, nombre) {
    const input = document.getElementById(`user-msg-${sku}`);
    const mensajeUsuario = input ? input.value.trim() : "";
    
    // Si el usuario escribió algo, lo agregamos al mensaje. Si no, enviamos uno estándar.
    let mensajeFinal = `Hola DS3, tengo una consulta sobre el producto *${sku} - ${nombre}*`;
    
    if (mensajeUsuario !== "") {
        mensajeFinal += `:%0A%0A"${mensajeUsuario}"`;
    }

    const url = `https://wa.me/51937700700?text=${mensajeFinal}`;
    window.open(url, '_blank');
}

// 2. Actualizar contador de caracteres
function updateCharCount(textarea, sku) {
    const countSpan = document.getElementById(`char-count-${sku}`);
    if (countSpan) {
        countSpan.innerText = textarea.value.length;
    }
}

// 3. Acordeón
function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('i');
    answer.classList.toggle('hidden');
    icon.style.transform = answer.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

// EJECUTAR
document.addEventListener("DOMContentLoaded", initProductTemplate);
// FORZAMOS A QUE LA FUNCIÓN SEA GLOBAL PARA QUE EL ONCLICK LA ENCUENTRE
// Función global para el intercambio de pestañas
window.changeProductTab = function(tab) {
    const infoContent = document.getElementById('tab-info-content');
    const galleryContent = document.getElementById('tab-gallery-content');
    const btnInfo = document.getElementById('btn-show-info');
    const btnGallery = document.getElementById('btn-show-gallery');

    if (!infoContent || !galleryContent) return;

    // Clases de estilo
    const active = "cursor-pointer px-8 py-3 border-b-2 border-blue-600 text-blue-600 font-bold text-sm transition-all uppercase";
    const inactive = "cursor-pointer px-8 py-3 border-b-2 border-transparent text-gray-500 hover:text-blue-600 font-bold text-sm transition-all uppercase";

    if (tab === 'info') {
        infoContent.style.display = 'block';
        galleryContent.style.display = 'none';
        btnInfo.className = active;
        btnGallery.className = inactive;
    } else {
        infoContent.style.display = 'none';
        galleryContent.style.display = 'block';
        btnGallery.className = active;
        btnInfo.className = inactive;
    }
};  