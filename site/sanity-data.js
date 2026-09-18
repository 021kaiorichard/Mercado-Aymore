const SANITY_CONFIG = {
  projectId: 'rv1fw9tb',
  dataset: 'production',
  apiVersion: 'v2024-01-01',
};

const PRODUCT_QUERY = `*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc) { _id, name, category, price, description, featured, image { asset { _ref } } }`;
const PROMOTION_QUERY = `*[_type == "promotion" && active == true && !(_id in path("drafts.**"))] | order(_createdAt desc) { _id, title, description, discount, active, image { asset { _ref } }, startDate, endDate }`;

function getSanityUrl(query) {
  return `https://${SANITY_CONFIG.projectId}.api.sanity.io/${SANITY_CONFIG.apiVersion}/data/query/${SANITY_CONFIG.dataset}?query=${encodeURIComponent(query)}`;
}

function formatPrice(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
}

function getImageUrl(image) {
  const ref = image?.asset?._ref;
  if (!ref) return '';
  // O _ref vem como "image-<id>-<largura>x<altura>-<formato>".
  // Precisa virar "<id>-<largura>x<altura>.<formato>" para ser uma URL válida.
  const withoutPrefix = ref.replace(/^image-/, '');
  const lastDash = withoutPrefix.lastIndexOf('-');
  const path = lastDash === -1
    ? withoutPrefix
    : `${withoutPrefix.slice(0, lastDash)}.${withoutPrefix.slice(lastDash + 1)}`;
  return `https://cdn.sanity.io/images/${SANITY_CONFIG.projectId}/${SANITY_CONFIG.dataset}/${path}`;
}

function ensureStyles() {
  if (document.getElementById('sanity-card-styles')) return;

  const style = document.createElement('style');
  style.id = 'sanity-card-styles';
  style.textContent = `
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 280px));
      justify-content: start;
      gap: 24px;
      margin-top: 18px;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--line, #e5e0d8);
      background: var(--white, #fff);
      box-shadow: 0 10px 28px rgba(30, 23, 17, 0.04);
    }
    .product-image {
      width: 100%;
      height: 190px;
      background: #f6f0eb;
      overflow: hidden;
    }
    .product-image img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-placeholder {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      font-weight: 700;
      color: var(--red, #e30613);
      background: linear-gradient(135deg, #f8f1ee, #f1e7df);
      text-align: center;
      padding: 20px;
    }
    .product-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 14px;
      padding: 18px;
    }
    .product-pill {
      display: inline-flex;
      align-self: flex-start;
      padding: 6px 10px;
      border-radius: 999px;
      background: #fff0e3;
      color: var(--red, #e30613);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .product-card h3 {
      margin: 0;
      font-size: 1.35rem;
      line-height: 1.2;
      font-family: Fraunces, Georgia, serif;
    }
    .product-card p {
      margin: 0;
      color: var(--muted, #66645f);
      font-size: 0.94rem;
    }
    .product-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: auto;
    }
    .product-bottom strong {
      font-size: 1.25rem;
      color: var(--ink, #171717);
    }
    .product-bottom button {
      padding: 10px 14px;
      border: none;
      border-radius: 4px;
      background: var(--red, #e30613);
      color: var(--white, #fff);
      font-weight: 700;
      cursor: pointer;
    }
    .promotions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 320px));
      justify-content: start;
      gap: 24px;
      margin-top: 18px;
    }
    .promotion-card {
      overflow: hidden;
      border: 1px solid var(--line, #e5e0d8);
      background: var(--white, #fff);
      box-shadow: 0 10px 28px rgba(30, 23, 17, 0.04);
    }
    .promotion-image {
      width: 100%;
      height: 210px;
      background: #f6f0eb;
    }
    .promotion-image img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .promotion-body {
      padding: 18px;
    }
    .promotion-badge-tag {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: #e30613;
      color: white;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .promotion-card h3 {
      margin: 14px 0 12px;
      font-size: 1.55rem;
      line-height: 1.2;
      font-family: Fraunces, Georgia, serif;
    }
    .promotion-card p {
      margin: 0 0 14px;
      color: var(--muted, #66645f);
      font-size: 0.94rem;
    }
    .promotion-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: var(--ink, #171717);
      font-size: 0.9rem;
      font-weight: 700;
    }
    .empty-state {
      display: grid;
      place-items: center;
      min-height: 220px;
      padding: 30px;
      border: 1px dashed #d9cfc2;
      background: var(--paper, #fbfaf8);
      text-align: center;
      color: var(--muted, #66645f);
    }
  `;
  document.head.appendChild(style);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

let cachedProducts = [];

function renderProducts(products, activeCategory) {
  const root = document.getElementById('products-list');
  if (!root) return;

  if (!products.length) {
    const isFiltered = activeCategory && activeCategory !== 'all';
    root.innerHTML = `
      <div class="empty-state">
        <div>
          <strong style="display:block; margin-bottom:8px; font-family:Fraunces,Georgia,serif; font-size:1.7rem; color:var(--ink,#171717);">${isFiltered ? 'Nenhum produto nessa categoria' : 'Ainda não há produtos'}</strong>
          <p>${isFiltered ? 'Escolha outra categoria ou veja todos os produtos.' : 'Crie seus itens no Sanity e publique para eles aparecerem aqui.'}</p>
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = products.map((product) => {
    const name = escapeHtml(product.name || 'Produto');
    const category = escapeHtml(product.category || 'Mercado');
    const description = escapeHtml(
      product.description ? product.description.slice(0, 120) : 'Produto do Mercado Aymoré.'
    );
    const imageUrl = getImageUrl(product.image);
    return `
    <article class="product-card">
      <div class="product-image">
        ${imageUrl
          ? `<img src="${escapeHtml(imageUrl)}" alt="${name}">`
          : `<div class="image-placeholder">Mercado Aymoré</div>`}
      </div>
      <div class="product-body">
        <span class="product-pill">${category}</span>
        <h3>${name}</h3>
        <p>${description}</p>
        <div class="product-bottom">
          <strong>${formatPrice(product.price)}</strong>
          <button type="button">Solicitar</button>
        </div>
      </div>
    </article>
  `;
  }).join('');
}

function wireCatalogTabs() {
  const tabs = document.querySelectorAll('.catalog-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const category = tab.dataset.category || 'all';
      const filtered = category === 'all'
        ? cachedProducts
        : cachedProducts.filter((product) => product.category === category);
      renderProducts(filtered, category);
    });
  });
}

async function loadProducts() {
  const root = document.getElementById('products-list');
  if (!root) return;

  ensureStyles();

  try {
    const response = await fetch(getSanityUrl(PRODUCT_QUERY));
    const result = await response.json();
    cachedProducts = result.result || result.products || [];
    renderProducts(cachedProducts, 'all');
    wireCatalogTabs();
  } catch (error) {
    console.error('Erro ao carregar produtos do Sanity:', error);
    root.innerHTML = `
      <div class="empty-state">
        <div>
          <strong style="display:block; margin-bottom:8px; font-family:Fraunces,Georgia,serif; font-size:1.7rem; color:var(--ink,#171717);">Não foi possível carregar</strong>
          <p>Verifique a conexão com o Sanity e publique pelo menos um produto.</p>
        </div>
      </div>
    `;
  }
}

async function loadPromotions() {
  const root = document.getElementById('promotions-list');
  if (!root) return;

  ensureStyles();

  try {
    const response = await fetch(getSanityUrl(PROMOTION_QUERY));
    const result = await response.json();
    const promotions = result.result || result.promotions || [];

    if (!promotions.length) {
      root.innerHTML = `
        <div class="empty-state">
          <div>
            <strong style="display:block; margin-bottom:8px; font-family:Fraunces,Georgia,serif; font-size:1.7rem; color:var(--ink,#171717);">Sem promoções no momento</strong>
            <p>Publique promoções no Sanity para elas aparecerem aqui.</p>
          </div>
        </div>
      `;
      return;
    }

    root.innerHTML = promotions.map((promotion) => {
      const title = escapeHtml(promotion.title || 'Promoção');
      const description = escapeHtml(promotion.description || 'Oferta especial do Mercado Aymoré.');
      const imageUrl = getImageUrl(promotion.image);
      return `
      <article class="promotion-card">
        <div class="promotion-image">
          ${imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" alt="${title}">`
            : `<div class="image-placeholder">Oferta</div>`}
        </div>
        <div class="promotion-body">
          <span class="promotion-badge-tag">-${promotion.discount || 0}%</span>
          <h3>${title}</h3>
          <p>${description}</p>
          <div class="promotion-meta">
            <span>${promotion.startDate ? new Date(promotion.startDate).toLocaleDateString('pt-BR') : 'Hoje'}</span>
            <span>${promotion.discount ? `-${promotion.discount}%` : 'Oferta'}</span>
          </div>
        </div>
      </article>
    `;
    }).join('');
  } catch (error) {
    console.error('Erro ao carregar promoções do Sanity:', error);
    root.innerHTML = `
      <div class="empty-state">
        <div>
          <strong style="display:block; margin-bottom:8px; font-family:Fraunces,Georgia,serif; font-size:1.7rem; color:var(--ink,#171717);">Não foi possível carregar</strong>
          <p>Verifique a conexão com o Sanity e publique pelo menos uma promoção.</p>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('products-list')) {
    loadProducts();
  }

  if (document.getElementById('promotions-list')) {
    loadPromotions();
  }
});
