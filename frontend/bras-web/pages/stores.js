import { storesApi } from '../api.js';
import { storeCard, setActiveNav } from '../utils.js';

export async function renderStores() {
  setActiveNav('lojas');

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="section">
      <div class="section__head">
        <h2 class="h2">Lojas</h2>
      </div>

      <div id="storesGrid" class="grid cols-3">
        <p>Carregando lojas...</p>
      </div>
    </section>
  `;

  try {
    const data = await storesApi.list();

    const stores = data.data?.stores || [];

    document.getElementById('storesGrid').innerHTML =
      stores.map(storeCard).join('');

  } catch (err) {
    document.getElementById('storesGrid').innerHTML =
      `<p>Erro ao carregar lojas.</p>`;
  }
}