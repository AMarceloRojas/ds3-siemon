# SIEMON – Catálogo de Cables | DS3 Comunicaciones

Este proyecto corresponde a la sección de la marca **SIEMON** dentro del sitio web corporativo de **DS3 Comunicaciones**.  
El objetivo es implementar una **página responsive, escalable y dinámica** para mostrar los productos (cables Cat5e, Cat6, Cat6A, Cat7, etc.) utilizando una sola plantilla HTML y un archivo de datos estructurados, evitando crear múltiples páginas individuales.

---

##  Estructura del Proyecto

SIEMON/
├── components/
│ └── navbar.html # Navbar reutilizable para todas las páginas
├── css/
│ ├── brand.siemon.css # Estilos de identidad visual (rojo/blanco SIEMON)
│ └── products.css # Estilos del catálogo y tarjetas de productos
├── docs/
│ └── siemon/
│ ├── cat5e/ # PDFs y fichas técnicas Cat5e
│ ├── cat6/ # PDFs Cat6
│ ├── cat6a/ # PDFs Cat6A
│ └── cat7/ # PDFs Cat7
├── imgs/
│ └── siemon/ # Imágenes de todos los productos SIEMON
├── js/
│ ├── nav.js # Carga dinámica del navbar
│ ├── product.grid.js # Generación automática del grid de productos
│ ├── product.detail.js # Plantilla dinámica de detalles de productos
│ └── products.siemon.js # Base de datos JSON/JS de productos SIEMON
├── productos/
│ └── index.html # Página del catálogo (grid) de productos
├── index.html # Landing principal de la marca SIEMON
└── README.md


---

## 🔁 Flujo de Funcionamiento

### **1. Landing SIEMON**
`SIEMON/index.html`  
Presentación inicial y acceso al catálogo completo.

### **2. Catálogo dinámico (Grid)**
`SIEMON/productos/index.html`

- El archivo `product.grid.js` lee los datos desde `products.siemon.js`.
- Cada producto del JSON se convierte automáticamente en una tarjeta.
- No se escribe HTML manual por cada producto.
- Cada tarjeta enlaza a un detalle único mediante `?id=`.

Ejemplo:  


---

### **3. Página de Detalle de Producto**
`product.detail.js`:

- Obtiene el parámetro `id` desde la URL.
- Busca ese producto dentro del JSON.
- Inserta dinámicamente:
  - Nombre
  - Descripción
  - Imagen
  - Categoría
  - Ficha técnica (PDF)
  - Especificaciones

Esto permite manejar **cientos de productos usando una sola plantilla**.

---

## 📦 Cómo Agregar un Nuevo Producto

1. Abrir:

SIEMON/js/products.siemon.js

2. Añadir un objeto como este:
 
{
    sku: '9A5M4-E2',
    category: 'cat5e',
    name: 'Cable UTP Cat5e F/UTP 305m PVC (CM)',
    gallery: [
      '../imgs/siemon/cat5e/9A5M4-E2/9A5M4-E2.jpg',
      '../imgs/siemon/cat5e/9A5M4-E2/9A5M4-E2.rollo.jpg',
      '../imgs/siemon/cat5e/9A5M4-E2/9A5M4-E2.Cable.jpg',
    ],
    summary: [
      'Rollo de 305 metros',
      'Cable F/UTP sólido de 04 pares Cat 5e',
      'Chaqueta PVC (CM, IEC 60332-1)',
      'Color gris'
    ],
    standards: [
      'ANSI/TIA-568.2-D — Cat 5e',
      'IEC 60332-1',
      'Aplicaciones: 10/100/1000BASE-T',
      'RoHS Compliant'
    ],
    description: 'Rollo de 305 metros de cable F/UTP sólido de 04 pares Cat 5e PVC (CM, IEC 60332-1), color gris, marca SIEMON.',
    specs: {
      'Categoría': 'Cat 5e',
      'Tipo': 'F/UTP',
      'Conductor': 'Sólido 24 AWG',
      'Longitud': '305 metros',
      'Chaqueta': 'PVC (CM)',
      'Color': 'Gris',
      'Norma': 'IEC 60332-1'
    },
    downloads: [
      { label: 'Ficha técnica (PDF)', href: '../docs/siemon/cat5e/9A5M4-E2/9A5M4-E2-SIEMON-ficha.pdf', icon: 'fa-file-pdf' },
      { label: 'Especificaciones (PDF)', href: '../docs/siemon/cat5e/9A5M4-E2/9A5M4-E2-SIEMON-specs.pdf', icon: 'fa-clipboard-list' }
    ]
  },

Guardar y actualizar el navegador → el producto aparece automáticamente en:

El grid

La página de detalle

La navegación dinámica

No se crea ningún HTML adicional.

Diseño Responsive

Adaptación a móviles, tablets y escritorio.

Layout flexible con CSS3 y media queries.

Imágenes optimizadas para carga rápida.

Estilos unificados según la marca SIEMON (rojo y blanco).

Tecnologías Utilizadas

HTML5

CSS3

JavaScript Vanilla

JSON/JS para base de datos

Arquitectura dinámica basada en plantillas reutilizables

- - Ventajas del Sistema - -

✔ No se crean múltiples index.html para cada producto
✔ Fácil de escalar a más marcas (AMP, Panduit, Dixon, etc.)
✔ Cada producto se agrega en segundos editando solo el JSON
✔ Actualización global sin duplicar código
✔ Arquitectura mantenible, profesional y modular