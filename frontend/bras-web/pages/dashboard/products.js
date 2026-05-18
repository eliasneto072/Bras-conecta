// ============================
// dashboard/products.js
// ============================

import { requireSeller } from '../../auth.js';
import { storesApi, productsApi } from '../../api.js';
import { brl } from '../../utils.js';

export async function renderDashboardProducts() {

  if (!requireSeller()) return;

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="dashboard">

      <aside class="dashboard__sidebar">

        <div>

          <h2 class="dashboard__logo">Brás Conecta</h2>

          <nav class="dashboard__nav">
            <a href="#/dashboard">Dashboard</a>
            <a class="active" href="#/dashboard/products">Produtos</a>
            <a href="#/dashboard/orders">Pedidos</a>
            <a href="#/dashboard/settings">Configurações</a>
          </nav>

        </div>

      </aside>

      <main class="dashboard__content">

        <div class="dashboard-page-header">

          <div>
            <h1>Produtos</h1>
            <p>Gerencie os produtos da sua loja</p>
          </div>

          <button class="btn" id="newProductBtn">
            + Novo Produto
          </button>

        </div>

        <div id="productsGrid" class="dashboard-products-grid">

          <div class="empty-box">
            Carregando produtos...
          </div>

        </div>

      </main>

    </section>
  `;

  try {

    // loja do seller
    const storesResponse = await storesApi.getMyStores();

    const stores =
      storesResponse.data?.stores || [];

    const store = stores[0];

    if (!store) {

      document.getElementById('productsGrid').innerHTML = `
        <div class="empty-box">
          Você ainda não possui loja cadastrada.
        </div>
      `;

      return;
    }

    // produtos
    const productsResponse =
      await productsApi.list(store.id);

    const products =
      productsResponse.data?.products || [];

    if (products.length === 0) {

      document.getElementById('productsGrid').innerHTML = `
        <div class="empty-box">
          Nenhum produto cadastrado ainda.
        </div>
      `;

      return;
    }

    document.getElementById('productsGrid').innerHTML =
      products.map(product => productCard(product)).join('');

  } catch (err) {

    console.error(err);

    document.getElementById('productsGrid').innerHTML = `
      <div class="empty-box">
        Erro ao carregar produtos.
      </div>
    `;
  }
}

function productCard(product) {

  const price =
    Number(product.priceFrom || 0);

  const variants =
    product.variants?.length || 0;

  return `
    <div class="dashboard-product-card">

      <div class="dashboard-product-image"></div>

      <div class="dashboard-product-body">

        <h3>${product.name}</h3>

        <p>
          ${product.description || 'Sem descrição'}
        </p>

        <div class="dashboard-product-meta">

          <span>${brl(price)}</span>

          <span>
            ${variants} variantes
          </span>

        </div>

        <div class="dashboard-product-actions">

          <button class="btn btn--ghost">
            Editar
          </button>

          <button class="btn-danger">
            Excluir
          </button>

        </div>

      </div>

    </div>
  `;
}