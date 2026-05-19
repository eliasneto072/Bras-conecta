// ============================
// pages/storeDetail.js
// ============================

import { storesApi, productsApi } from '../api.js';
import { productCard } from '../utils.js';

export async function renderStoreDetail(slug) {
  const $app = document.getElementById('app');

  $app.innerHTML = `<section class="section"><p class="muted">Carregando loja...</p></section>`;

  try {
    const storesData = await storesApi.list();
    const store      = storesData.data?.stores.find(s => s.slug === slug);

    if (!store) {
      $app.innerHTML = `<section class="section"><p class="muted">Loja não encontrada.</p></section>`;
      return;
    }

    const productsData = await productsApi.list(store.id);
    const products     = productsData.data?.products || [];

    $app.innerHTML = `
      <section class="section" style="padding-top:0">

        <!-- Banner -->
        <div class="store-detail-banner" style="
          background-image: url('${store.bannerUrl || ''}');
          background-color: var(--border);
        ">
          ${!store.bannerUrl ? '<span class="muted" style="font-size:13px">Sem banner</span>' : ''}
        </div>

        <!-- Header da loja -->
        <div class="store-detail-header">
          <div
            class="store-detail-logo"
            style="background-image: url('${store.logoUrl || ''}');"
          >
            ${!store.logoUrl ? '🏪' : ''}
          </div>
          <div class="store-detail-info">
            <div style="display:flex;align-items:center;gap:8px">
              <h2 class="h2" style="margin:0">${store.name}</h2>
              ${store.verified ? `<span class="badge">Verificada</span>` : ''}
            </div>
            <p class="muted" style="margin:4px 0 0">${store.city || ''}${store.city && store.state ? ' / ' : ''}${store.state || ''}</p>
            ${store.description ? `<p class="p" style="margin-top:8px">${store.description}</p>` : ''}
          </div>
        </div>

        <div class="hr"></div>

        <!-- Produtos -->
        <h3 style="margin-bottom:16px">Produtos</h3>

        ${products.length === 0
          ? `<div class="empty-box">Nenhum produto cadastrado ainda.</div>`
          : `<div class="grid cols-3">${products.map(productCard).join('')}</div>`
        }

      </section>
    `;

  } catch (err) {
    $app.innerHTML = `<section class="section"><p class="muted">Erro ao carregar loja.</p></section>`;
  }
}