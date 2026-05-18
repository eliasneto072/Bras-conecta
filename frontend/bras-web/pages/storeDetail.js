import { storesApi, productsApi } from '../api.js';
import { productCard } from '../utils.js';

export async function renderStoreDetail(slug) {
  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="section">
      <p>Carregando loja...</p>
    </section>
  `;

  try {
    const storesData = await storesApi.list();

    const store = storesData.data?.stores.find(
      s => s.slug === slug
    );

    if (!store) {
      $app.innerHTML = `<p>Loja não encontrada.</p>`;
      return;
    }

    const productsData = await productsApi.list(store.id);

    const products = productsData.data?.products || [];

    $app.innerHTML = `
      <section class="section">
        <h2 class="h2">${store.name}</h2>

        <p class="p">
          ${store.description || ''}
        </p>

        <div class="grid cols-3">
          ${products.map(productCard).join('')}
        </div>
      </section>
    `;

  } catch (err) {
    $app.innerHTML = `
      <p>Erro ao carregar loja.</p>
    `;
  }
}