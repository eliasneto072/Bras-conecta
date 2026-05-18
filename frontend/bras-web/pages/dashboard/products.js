// ============================
// dashboard/products.js
// ============================

import { requireSeller } from '../../auth.js';
import { storesApi, productsApi, uploadApi } from '../../api.js';
import { brl } from '../../utils.js';

let currentStore = null;
let currentProduct = null;

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

    <!-- MODAL PRODUTO -->
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

          <div class="label">Imagem do produto</div>

<input
  class="input"
  id="productImage"
  type="file"
  accept="image/*"
/>

<div style="height:12px"></div>

<img
  id="productPreview"
  style="
    width:100%;
    height:220px;
    object-fit:cover;
    border-radius:16px;
    display:none;
  "
/>

<div class="hr"></div>

          <button class="btn" id="saveProductBtn">
            Criar Produto
          </button>

        </div>

      </div>

    </div>

    <!-- MODAL VARIANTES -->
    <div id="variantModal" class="modal hidden">

      <div class="modal__content">

        <div class="modal__header">

          <h2>Gerenciar Variantes</h2>

          <button id="closeVariantModalBtn" class="modal__close">
            ✕
          </button>

        </div>

        <div class="modal__body">

          <div class="label">Cor</div>

          <input
            class="input"
            id="variantColor"
            type="text"
            placeholder="Preto"
          />

          <div class="hr"></div>

          <div class="label">Tamanho</div>

          <input
            class="input"
            id="variantSize"
            type="text"
            placeholder="M"
          />

          <div class="hr"></div>

          <div class="label">Preço</div>

          <input
            class="input"
            id="variantPrice"
            type="number"
            placeholder="25.90"
          />

          <div class="hr"></div>

          <div class="label">Estoque</div>

          <input
            class="input"
            id="variantStock"
            type="number"
            placeholder="100"
          />

          <div class="hr"></div>

          <button class="btn" id="saveVariantBtn">
            Adicionar Variante
          </button>

          <div class="hr"></div>

          <div id="variantsList"></div>

        </div>

      </div>

    </div>
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

    } else {

      document.getElementById('productsGrid').innerHTML =
        products.map(product => productCard(product)).join('');
    }

    setupModal(store);
    setupVariants(store, products);

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

      <div class="dashboard-product-image">

  <img
    src="${
      product.coverImage ||
      'https://placehold.co/600x400?text=Produto'
    }"
    alt="${product.name}"
  />

</div>

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

          <button
            class="btn btn--ghost manageVariantsBtn"
            data-product="${product.id}"
          >
            Variantes
          </button>

          <button class="btn btn--ghost">
            Editar
          </button>

          <button
  class="btn-danger deleteProductBtn"
  data-product="${product.id}"
>
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

    const imageInput =
  document.getElementById('productImage');

const preview =
  document.getElementById('productPreview');

imageInput.addEventListener('change', () => {

  const file =
    imageInput.files[0];

  if (!file) return;

  preview.src =
    URL.createObjectURL(file);

  preview.style.display = 'block';

});

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

  const imageFile =
    document.getElementById('productImage')
    .files[0];

  let coverImage = null;

  // upload cloudinary
  if (imageFile) {

    const upload =
      await uploadApi.image(imageFile);

    coverImage =
      upload.data.secure_url;

  }

  await productsApi.create(store.id, {
    name,
    description,
    priceFrom,
    minQty,
    coverImage
  });

  alert('Produto criado com sucesso');

        modal.classList.add('hidden');

        renderDashboardProducts();

      } catch (err) {

        console.error(err);

        alert('Erro ao criar produto');

      }

    });
}

function setupVariants(store, products) {

  const modal =
    document.getElementById('variantModal');

  // abrir modal
  document
    .querySelectorAll('.manageVariantsBtn')
    .forEach(btn => {

      btn.addEventListener('click', () => {

        const productId =
          btn.dataset.product;

        currentProduct =
          products.find(p => p.id === productId);

        renderVariants();

        modal.classList.remove('hidden');

      });

    });

  // fechar
  document
    .getElementById('closeVariantModalBtn')
    .addEventListener('click', () => {

      modal.classList.add('hidden');

    });

  // salvar variante
  document
    .getElementById('saveVariantBtn')
    .addEventListener('click', async () => {

      if (!currentProduct) return;

      const color =
        document.getElementById('variantColor').value.trim();

      const size =
        document.getElementById('variantSize').value.trim();

      const price =
        Number(document.getElementById('variantPrice').value);

      const stock =
        Number(document.getElementById('variantStock').value);

      try {

        await productsApi.addVariant(
          store.id,
          currentProduct.id,
          {
            color,
            size,
            price,
            stock
          }
        );

        // limpa campos
        document.getElementById('variantColor').value = '';
        document.getElementById('variantSize').value = '';
        document.getElementById('variantPrice').value = '';
        document.getElementById('variantStock').value = '';

        // recarrega produtos
        const updated =
          await productsApi.list(store.id);

        const updatedProducts =
          updated.data?.products || [];

        currentProduct =
          updatedProducts.find(
            p => p.id === currentProduct.id
          );

        renderVariants();

      } catch (err) {

        console.error(err);

        alert('Erro ao adicionar variante');

      }

    });

  // excluir produto
document
  .querySelectorAll('.deleteProductBtn')
  .forEach(btn => {

    btn.addEventListener('click', async () => {

      const productId =
        btn.dataset.product;

      const confirmDelete =
        confirm('Deseja excluir este produto?');

      if (!confirmDelete) return;

      try {

        await productsApi.remove(
          store.id,
          productId
        );

        alert('Produto excluído');

        renderDashboardProducts();

      } catch (err) {

        console.error(err);

        alert('Erro ao excluir produto');

      }

    });

  });
}

function renderVariants() {

  const list =
    document.getElementById('variantsList');

  if (!currentProduct) {

    list.innerHTML = '';
    return;

  }

  const variants =
    currentProduct.variants || [];

  if (variants.length === 0) {

    list.innerHTML = `
      <div class="empty-box">
        Nenhuma variante cadastrada.
      </div>
    `;

    return;
  }

  list.innerHTML =
    variants.map(variant => `

      <div class="variant-item">

        <div>
          <strong>${variant.color}</strong>
          / ${variant.size}
        </div>

        <div>
          R$ ${Number(variant.price).toFixed(2)}
        </div>

        <div>
          estoque: ${variant.stock}
        </div>

      </div>

    `).join('');
}