// /SIEMON/js/product.detail.js
import { PRODUCTS } from './products.siemon.js';

const path = window.location.pathname;
const isInProductos = path.includes('/productos/');
const PREFIX = isInProductos ? '../' : './';
const FAQ_WHATSAPP = '51937700700';

/* ===================== UTILIDADES ===================== */
const $ = (s) => document.querySelector(s);
const DEFAULT_IMG = PREFIX + 'SIEMON/icons/Siemonlogo.png';
const WHATSAPP_PHONE = '51937514867';

function buildWhatsAppUrl(product, actionType = 'comprar') {
  const brand = product.brand || 'SIEMON';
  const currentUrl = location.href;
  
  let text = actionType === 'cotizar' 
    ? `Hola, deseo cotizar el producto de la marca ${brand}, modelo ${product.sku}.` 
    : `Hola, deseo comprar el producto de la marca ${brand}, modelo ${product.sku}.`;
  
  if (product.price && actionType === 'comprar') {
    text += ` Precio: U$ ${product.price}.`;
  }
  
  text += ` Link: ${currentUrl}`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

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
  const crumbSku = $('#crumbSku');
  if (crumbSku) crumbSku.textContent = p.sku;

  const infoBlock = `
  <div class="text-slate-700 w-full">
    <div class="border p-5 rounded-md bg-white shadow-sm">
    <h1 class="font-extrabold mb-4 text-xl md:text-2xl lg:text-3xl text-slate-800 leading-tight">
        ${escapeHtml(p.name)} — Ref. ${escapeHtml(p.sku)}
      </h1>
      
      <ul class="text-base text-slate-600 mb-5 space-y-2 leading-relaxed">
        ${(p.summary || []).map(item => `<li>- ${escapeHtml(item)}</li>`).join('')}
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

      <!-- PESTAÑAS ARRIBA -->
      <div class="flex justify-center border-b mt-8 mb-6">
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

      <!-- CONTENEDOR DE CONTENIDO QUE CAMBIA -->
      <div class="relative">

          <!-- TAB: PRODUCTO -->
          <div id="tab-info-content" class="w-full">
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

          <!-- TAB: IMÁGENES -->
          <div id="tab-gallery-content" class="w-full hidden">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                  ${(p.gallery || []).map(img => `
                      <div class="border border-gray-200 rounded-xl overflow-hidden h-64 bg-white flex items-center justify-center p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                          <img src="${fixRel(img)}" 
                               class="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300" 
                               alt="Imagen del producto"
                               onclick="window.openImageZoom('${fixRel(img)}')">
                      </div>
                  `).join('')}
              </div>
          </div>
      </div>
    </div>
  `;

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
    
    const productUrl = isInProductos 
      ? `./index.html?sku=${encodeURIComponent(p.sku)}` 
      : `./productos/index.html?sku=${encodeURIComponent(p.sku)}`;
    
    return `
      <a href="${productUrl}" 
         class="group relative bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden block flex-shrink-0 w-[280px] sm:w-[300px] lg:w-auto snap-start">        
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
            
            <div class="pt-2 border-t border-gray-100 mt-2">
              <p class="text-lg font-black text-blue-600">
                ${price}
                ${p.price ? '<span class="text-[10px] text-gray-500 font-normal ml-1">+ IGV</span>' : ''}
              </p>
            </div>
          </div>
        </div>

        <!-- HOVER OVERLAY - Funciona en desktop al hacer hover, en móvil al tocar -->
        <div class="product-hover-overlay absolute inset-0 bg-white/98 p-6 opacity-0 pointer-events-none lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto transition-all duration-300 flex flex-col translate-y-4 lg:group-hover:translate-y-0 border-2 border-blue-500 rounded-xl">
          
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

  // ✅ RESPONSIVE MEJORADO: Scroll horizontal en móvil con snap, grid en desktop
  grid.className = 'mt-6 flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 snap-x snap-mandatory lg:snap-none px-4 lg:px-0 -mx-4 lg:mx-0';
  
  // ✅ Estilos para scrollbar personalizada
  grid.style.scrollbarWidth = 'thin';
  grid.style.scrollbarColor = '#3b82f6 #e5e7eb';
  grid.style.scrollPaddingLeft = '1rem';
  grid.style.scrollPaddingRight = '1rem';
  
  grid.innerHTML = cards.map(cardTpl).join('');

  // ✅ ACTIVAR OVERLAY EN MÓVIL AL TOCAR
  setTimeout(() => {
    const productCards = grid.querySelectorAll('a.group');
    
    productCards.forEach(card => {
      const overlay = card.querySelector('.product-hover-overlay');
      
      if (overlay) {
        // Evento táctil para móvil/tablet
        card.addEventListener('touchstart', (e) => {
          if (window.innerWidth < 1024) { // Solo en móvil/tablet
            // Si el overlay ya está visible, permitir que el link funcione
            if (overlay.style.opacity === '1') {
              return; // Permitir navegación
            }
            
            // Si no está visible, mostrarlo y prevenir navegación
            e.preventDefault();
            
            // Ocultar otros overlays
            productCards.forEach(otherCard => {
              const otherOverlay = otherCard.querySelector('.product-hover-overlay');
              if (otherOverlay && otherOverlay !== overlay) {
                otherOverlay.style.opacity = '0';
                otherOverlay.style.pointerEvents = 'none';
                otherOverlay.style.transform = 'translateY(1rem)';
              }
            });
            
            // Mostrar este overlay
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
            overlay.style.transform = 'translateY(0)';
          }
        });
      }
    });

    // ✅ Cerrar overlay al tocar fuera
    document.addEventListener('touchstart', (e) => {
      if (window.innerWidth < 1024 && !e.target.closest('a.group')) {
        productCards.forEach(card => {
          const overlay = card.querySelector('.product-hover-overlay');
          if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            overlay.style.transform = 'translateY(1rem)';
          }
        });
      }
    });
  }, 100);
}

// --- ZOOM MODAL ---
(function setupZoom() {
  if (document.getElementById('zoomContainer')) return;

  const zoomDiv = document.createElement('div');
  zoomDiv.id = 'zoomContainer';
  zoomDiv.className = `fixed inset-0 z-[100] hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4`;

  zoomDiv.innerHTML = `
    <div id="zoomPanel" class="relative w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-gradient-to-b from-white/5 to-white/0 transform transition duration-200 ease-out scale-95 opacity-0">
      <button id="zoomClose" class="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white text-2xl leading-none flex items-center justify-center transition" aria-label="Cerrar">&times;</button>
      <div class="p-3 md:p-5">
        <div class="w-full h-[70vh] flex items-center justify-center">
          <img id="zoomImg" src="" class="max-w-full max-h-full object-contain rounded-xl shadow-lg select-none" alt="Zoom" draggable="false" />
        </div>
        <p class="mt-3 text-center text-white/70 text-sm">Click fuera o ESC para cerrar</p>
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

  zoomDiv.addEventListener('click', (e) => {
    if (e.target === zoomDiv) closeZoom();
  });

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

  window.openImageZoom = openZoom;
})();

// --- RENDER FAQ DINÁMICO ---
function renderProductoFAQ(producto) {
  const container = document.getElementById('dynamic-faq-container');
  if (!container || !producto.faq || !producto.faq.length) return;

  const faqItemsHTML = producto.faq.map((item) => `
    <div class="faq-item mb-4 border rounded-md overflow-hidden">
      <button class="faq-question w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center" 
              onclick="window.toggleFaq(this)">
        <span class="font-medium text-gray-800">${escapeHtml(item.q)}</span>
        <i class="fas fa-chevron-down transition-transform duration-300"></i>
      </button>
      <div class="faq-answer p-4 bg-white hidden border-t">
        <p class="text-gray-700">${escapeHtml(item.a)}</p>
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
              oninput="window.updateCharCount(this, '${producto.sku}')"
            ></textarea>
            <div class="mt-1 text-sm text-gray-500 flex justify-between">
              <span>Escribe tu pregunta específica sobre el producto</span>
              <span><span id="char-count-${producto.sku}">0</span>/500</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              id="btn-enviar-${producto.sku}"
              onclick="window.enviarWSP('${producto.sku}', '${escapeHtml(producto.name)}')"
              disabled
              class="bg-green-600 text-white font-medium py-3 px-6 rounded-md transition duration-200 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
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

// ✅ FUNCIONES GLOBALES
window.updateCharCount = function(textarea, sku) {
  const countSpan = document.getElementById(`char-count-${sku}`);
  const btnEnviar = document.getElementById(`btn-enviar-${sku}`);
  
  const currentLength = textarea.value.length;
  
  if (countSpan) {
    countSpan.innerText = currentLength;
  }
  
  if (btnEnviar) {
    const hasValidText = textarea.value.trim().length >= 3;
    btnEnviar.disabled = !hasValidText;
    
    if (hasValidText) {
      btnEnviar.classList.remove('opacity-50', 'cursor-not-allowed');
      btnEnviar.classList.add('hover:bg-green-700');
    } else {
      btnEnviar.classList.add('opacity-50', 'cursor-not-allowed');
      btnEnviar.classList.remove('hover:bg-green-700');
    }
  }
};

window.enviarWSP = function(sku, nombre) {
  const input = document.getElementById(`user-msg-${sku}`);
  const mensajeUsuario = input ? input.value.trim() : "";
  
  if (mensajeUsuario.length < 3) {
    alert('Por favor, escribe tu pregunta antes de enviar');
    return;
  }
  
  let mensajeFinal = `Hola DS3, tengo una consulta sobre el producto *${sku} - ${nombre}*:%0A%0A"${mensajeUsuario}"`;
  
  const url = `https://wa.me/51937700700?text=${mensajeFinal}`;
  window.open(url, '_blank');
  
  if (input) {
    input.value = '';
    window.updateCharCount(input, sku);
  }
};

window.toggleFaq = function(button) {
  const answer = button.nextElementSibling;
  const icon = button.querySelector('i');
  answer.classList.toggle('hidden');
  icon.style.transform = answer.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
};

// ✅ TABS - FUNCIÓN PRINCIPAL QUE INTERCAMBIA CONTENIDO
window.changeProductTab = function(tab) {
  const infoContent = document.getElementById('tab-info-content');
  const galleryContent = document.getElementById('tab-gallery-content');
  const btnInfo = document.getElementById('btn-show-info');
  const btnGallery = document.getElementById('btn-show-gallery');

  if (!infoContent || !galleryContent) return;

  const activeTabClasses = 'border-b-2 border-blue-600 text-blue-600';
  const inactiveTabClasses = 'border-b-2 border-transparent text-gray-500 hover:text-blue-600';

  if (tab === 'info') {
    // Mostrar PRODUCTO
    infoContent.classList.remove('hidden');
    galleryContent.classList.add('hidden');
    
    btnInfo.className = `cursor-pointer px-8 py-3 ${activeTabClasses} font-bold text-sm transition-all uppercase`;
    btnGallery.className = `cursor-pointer px-8 py-3 ${inactiveTabClasses} font-bold text-sm transition-all uppercase`;
  } else if (tab === 'gallery') {
    // Mostrar IMÁGENES
    infoContent.classList.add('hidden');
    galleryContent.classList.remove('hidden');
    
    btnGallery.className = `cursor-pointer px-8 py-3 ${activeTabClasses} font-bold text-sm transition-all uppercase`;
    btnInfo.className = `cursor-pointer px-8 py-3 ${inactiveTabClasses} font-bold text-sm transition-all uppercase`;
  }
};

// ✅ INIT - CARGAR PRODUCTO AL INICIAR
(async function init() {
  const sku = getSku();
  if (!sku) {
    $('#productView').innerHTML = '<p class="p-10 text-center text-red-600">No se encontró el SKU del producto.</p>';
    return;
  }

  const product = PRODUCTS.find(p => p.sku === sku);
  if (!product) {
    $('#productView').innerHTML = '<p class="p-10 text-center text-red-600">Producto no encontrado.</p>';
    return;
  }

  renderProduct(product);
  renderSimilar(product);
  renderProductoFAQ(product);
})();

// ✅ ACTIVAR MARCA SIEMON
(function(){
  const container = document.getElementById('brandsScroll');
  if (!container) return;

  const cards = [...container.querySelectorAll('.brand-card')];
  if (!cards.length) return;

  const currentBrand = 'siemon';

  const active = cards.find(c => (c.dataset.brand || '').toLowerCase() === currentBrand);
  if (!active) return;

  active.classList.add('is-active');
  container.prepend(active);
})();