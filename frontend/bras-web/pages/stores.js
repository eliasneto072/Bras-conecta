import { storesApi } from '../api.js';
import { storeCard, setActiveNav, skeletonStoreCards } from '../utils.js';

export async function renderStores() {
  setActiveNav('lojas');
  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="section">
      <div class="section__head">
        <h2 class="h2">Lojas</h2>
      </div>
      <div id="storesGrid" class="grid cols-3">
        ${skeletonStoreCards(6)}
      </div>
    </section>
  `;

  try {
    const data = await storesApi.list();
    const stores = data.data?.stores || [];

    document.getElementById('storesGrid').innerHTML =
      stores.length
        ? stores.map(storeCard).join('')
        : `<div class="empty-state" style="grid-column:1/-1">
            <span class="empty-state__icon">🏪</span>
            <p class="empty-state__title">Nenhuma loja cadastrada ainda</p>
            <p class="empty-state__sub">Seja o primeiro lojista da plataforma.</p>
            <a class="btn" href="#/login">Cadastrar loja</a>
          </div>`;
  } catch (err) {
    document.getElementById('storesGrid').innerHTML =
      `<div class="empty-state empty-state--error" style="grid-column:1/-1">
        <span class="empty-state__icon">⚠️</span>
        <p class="empty-state__title">Erro ao carregar lojas</p>
        <p class="empty-state__sub">Verifique sua conexão e recarregue a página.</p>
      </div>`;
  }
}