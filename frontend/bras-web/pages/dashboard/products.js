// ============================
// dashboard/products.js
// ============================

import { requireSeller } from '../../auth.js';
import { storesApi, productsApi } from '../../api.js';
import { brl } from '../../utils.js';

let currentStore = null;

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

          <div id="productModal" class="modal hidden">

  <div class="modal__content">

    <div class="modal__header">

      <h2>Novo Produto</h2>

      <button id="closeModalBtn" class="modal__close">
        ✕
      </button>

    </div>

    <div class="modal__body">

      <div class="label">Nome</div>
      <input
        class="input"
        id="productName"
        type="text"
        placeholder="Nome do produto"
      />

      <div class="hr"></div>

      <div class="label">Descrição</div>
      <textarea
        class="input"
        id="productDescription"
        rows="4"
        placeholder="Descrição"
      ></textarea>

      <div class="hr"></div>

      <div class="label">Preço inicial</div>
      <input
        class="input"
        id="productPrice"
        type="number"
        placeholder="0.00"
      />

      <div class="hr"></div>

      <div class="label">Quantidade mínima</div>
      <input
        class="input"
        id="productMinQty"
        type="number"
        placeholder="1"
      />

      <div class="hr"></div>

      <button class="btn" id="saveProductBtn">
        Criar Produto
      </button>

    </div>

  </div>

</div>

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

    currentStore = store;

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
      setupModal(store);

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

function setupModal(store) {

  const modal =
    document.getElementById('productModal');

  // abrir
  document
    .getElementById('newProductBtn')
    .addEventListener('click', () => {

      modal.classList.remove('hidden');

    });

  // fechar
  document
    .getElementById('closeModalBtn')
    .addEventListener('click', () => {

      modal.classList.add('hidden');

    });

  // salvar produto
  document
    .getElementById('saveProductBtn')
    .addEventListener('click', async () => {

      const name =
        document.getElementById('productName').value.trim();

      const description =
        document.getElementById('productDescription').value.trim();

      const priceFrom =
        Number(document.getElementById('productPrice').value);

      const minQty =
        Number(document.getElementById('productMinQty').value);

      if (!name) {
        alert('Digite o nome do produto');
        return;
      }

      try {

        await productsApi.create(store.id, {
          name,
          description,
          priceFrom,
          minQty
        });

        alert('Produto criado com sucesso');

        modal.classList.add('hidden');

        // reload página
        renderDashboardProducts();

      } catch (err) {

        console.error(err);

        alert('Erro ao criar produto');

      }

    });
}