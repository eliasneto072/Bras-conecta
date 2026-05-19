// ============================
// pages/home.js
// ============================

import { storesApi, productsApi } from '../api.js';
import { brl, storeCard, productCard, setActiveNav, skeletonStoreCards, skeletonProductCards } from '../utils.js';

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
        ${skeletonStoreCards(3)}
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="h2">Produtos em alta</h2>
      </div>
      <div class="grid cols-3" id="hotProducts">
        ${skeletonProductCards(6)}
      </div>
    </section>
  `;

  try {
    const [storesData] = await Promise.all([storesApi.list()]);
    const stores = storesData.data?.stores || [];

    document.getElementById('featuredStores').innerHTML =
      stores.slice(0, 3).map(storeCard).join('') || emptyState('lojas');

    const productPromises = stores.slice(0, 3).map(s =>
      productsApi.list(s.id).then(d => d.data?.products || []).catch(() => [])
    );
    const productsNested = await Promise.all(productPromises);
    const allProducts = productsNested.flat().slice(0, 6);

    document.getElementById('hotProducts').innerHTML =
      allProducts.map(productCard).join('') || emptyState('produtos');

  } catch (err) {
    document.getElementById('featuredStores').innerHTML = errorState('lojas');
    document.getElementById('hotProducts').innerHTML = errorState('produtos');
  }
}

function emptyState(tipo) {
  return `<div class="empty-state" style="grid-column:1/-1">
    <span class="empty-state__icon">🏪</span>
    <p class="empty-state__title">Nenhuma ${tipo} ainda</p>
    <p class="empty-state__sub">Em breve novos itens aparecerão aqui.</p>
  </div>`;
}

function errorState(tipo) {
  return `<div class="empty-state empty-state--error" style="grid-column:1/-1">
    <span class="empty-state__icon">⚠️</span>
    <p class="empty-state__title">Erro ao carregar ${tipo}</p>
    <p class="empty-state__sub">Verifique sua conexão e tente novamente.</p>
  </div>`;
}