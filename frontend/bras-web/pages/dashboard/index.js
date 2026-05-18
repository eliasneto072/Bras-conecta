// ============================
// pages/dashboard/index.js
// ============================

import { requireSeller, getUser } from '../../auth.js';
import { storesApi } from '../../api.js';

export async function renderDashboard() {

  // protege rota
  if (!requireSeller()) return;

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="dashboard">

      <aside class="dashboard__sidebar">

        <div>
          <h2 class="dashboard__logo">Brás Conecta</h2>

          <nav class="dashboard__nav">
            <a href="#/dashboard">Dashboard</a>
            <a href="#/dashboard/products">Produtos</a>
            <a href="#/dashboard/orders">Pedidos</a>
            <a href="#/dashboard/settings">Configurações</a>
          </nav>
        </div>

        <div class="dashboard__footer">
          <small>Seller Panel</small>
        </div>

      </aside>

      <main class="dashboard__content">

        <div class="dashboard__top">
          <div>
            <h1>Painel do Lojista</h1>
            <p id="dashboardStoreName">Carregando loja...</p>
          </div>

          <div class="dashboard__user">
            ${getUser()?.name || 'Usuário'}
          </div>
        </div>

        <div class="dashboard__stats">

          <div class="stat-card">
            <h3>Produtos</h3>
            <p id="productsCount">0</p>
          </div>

          <div class="stat-card">
            <h3>Pedidos</h3>
            <p>0</p>
          </div>

          <div class="stat-card">
            <h3>Faturamento</h3>
            <p>R$ 0,00</p>
          </div>

        </div>

        <div class="dashboard__section">

          <h2>Sua loja</h2>

          <div id="dashboardStoreBox">
            Carregando...
          </div>

        </div>

      </main>

    </section>
  `;

  try {

    const response = await storesApi.getMyStores();

    const stores = response.data?.stores || response.stores || [];

    const store = stores[0];

    if (!store) {

      document.getElementById('dashboardStoreName').innerText =
        'Nenhuma loja cadastrada';

      document.getElementById('dashboardStoreBox').innerHTML = `
        <div class="empty-box">
          Você ainda não possui loja cadastrada.
        </div>
      `;

      return;
    }

    document.getElementById('dashboardStoreName').innerText =
      store.name;

    document.getElementById('dashboardStoreBox').innerHTML = `
      <div class="store-card">

        <h3>${store.name}</h3>

        <p>${store.description || 'Sem descrição'}</p>

        <div class="store-meta">
          <span>${store.city || '-'} / ${store.state || '-'}</span>
          <span>Pedido mínimo: R$ ${store.minOrderValue || '0'}</span>
        </div>

      </div>
    `;

  } catch (err) {

    document.getElementById('dashboardStoreName').innerText =
      'Erro ao carregar loja';

    document.getElementById('dashboardStoreBox').innerHTML = `
      <div class="empty-box">
        Erro ao carregar dados.
      </div>
    `;
  }
}