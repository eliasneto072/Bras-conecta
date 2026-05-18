// ============================
// pages/home.js
// ============================

import { storesApi, productsApi } from '../api.js';
import { brl, storeCard, productCard, setActiveNav } from '../utils.js';

export async function renderHome() {
  setActiveNav(null);
  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="hero">
      <div class="hero__grid">
        <div>
          <h1 class="h1">Encontre atacado do Brás sem caos de catálogo no WhatsApp</h1>
          <p class="p">Navegue por lojas, produtos e monte seu pedido. Depois, finalize direto no WhatsApp.</p>
          <div class="hero__actions">
            <a class="btn" href="#/lojas">Ver lojas</a>
            <a class="btn btn--ghost" href="#/carrinho">Abrir carrinho</a>
          </div>
          <div class="hero__chips">
            <span class="chip">Atacado</span>
            <span class="chip">Pedido mínimo</span>
            <span class="chip">WhatsApp</span>
            <span class="chip">Lançamentos</span>
          </div>
        </div>
        <div class="hero__image" aria-hidden="true"></div>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="h2">Lojas em destaque</h2>
        <a class="link" href="#/lojas">Ver todas</a>
      </div>
      <div class="grid cols-3" id="featuredStores">
        ${skeletonCards(3)}
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="h2">Produtos em alta</h2>
      </div>
      <div class="grid cols-3" id="hotProducts">
        ${skeletonCards(6)}
      </div>
    </section>
  `;

  // carrega lojas e produtos em paralelo
  try {
    const [storesData] = await Promise.all([
      storesApi.list(),
    ]);

    const stores = storesData.data?.stores || [];

    document.getElementById('featuredStores').innerHTML =
      stores.slice(0, 3).map(storeCard).join('') || '<p class="muted">Nenhuma loja ainda.</p>';

    // carrega produtos das primeiras lojas
    const productPromises = stores.slice(0, 3).map(s =>
      productsApi.list(s.id).then(d => d.data?.products || []).catch(() => [])
    );
    const productsNested = await Promise.all(productPromises);
    const allProducts = productsNested.flat().slice(0, 6);

    document.getElementById('hotProducts').innerHTML =
      allProducts.map(productCard).join('') || '<p class="muted">Nenhum produto ainda.</p>';

  } catch (err) {
    document.getElementById('featuredStores').innerHTML = `<p class="muted">Erro ao carregar lojas.</p>`;
    document.getElementById('hotProducts').innerHTML = `<p class="muted">Erro ao carregar produtos.</p>`;
  }
}

function skeletonCards(n) {
  return Array(n).fill(`
    <div class="card skeleton">
      <div class="cover" style="background:#f0f0f0"></div>
      <div class="card__body">
        <div style="height:16px;background:#f0f0f0;border-radius:8px;margin-bottom:8px"></div>
        <div style="height:12px;background:#f0f0f0;border-radius:8px;width:60%"></div>
      </div>
    </div>
  `).join('');
}