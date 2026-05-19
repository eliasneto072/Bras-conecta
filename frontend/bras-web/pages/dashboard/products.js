// ============================
// dashboard/products.js
// ============================

import { requireSeller } from '../../auth.js';
import { storesApi, productsApi, uploadApi } from '../../api.js';
import { brl } from '../../utils.js';

let currentStore   = null;
let currentProduct = null;
let editingProduct = null;
let editingVariantId = null; // ← controla se estamos editando ou criando variante

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
          <button class="btn" id="newProductBtn">+ Novo Produto</button>
        </div>

        <div id="productsGrid" class="dashboard-products-grid">
          <div class="empty-box">Carregando produtos...</div>
        </div>

      </main>
    </section>

    <!-- MODAL PRODUTO -->
    <div id="productModal" class="modal hidden">
      <div class="modal__content">
        <div class="modal__header">
          <h2>Novo Produto</h2>
          <button id="closeModalBtn" class="modal__close">✕</button>
        </div>
        <div class="modal__body">

          <div class="label">Nome</div>
          <input class="input" id="productName" type="text" placeholder="Nome do produto" />
          <div class="hr"></div>

          <div class="label">Descrição</div>
          <textarea class="input" id="productDescription" rows="4" placeholder="Descrição"></textarea>
          <div class="hr"></div>

          <div class="label">Preço inicial (exibição)</div>
          <input class="input" id="productPrice" type="number" placeholder="0.00" />
          <div class="hr"></div>

          <div class="label">Quantidade mínima</div>
          <input class="input" id="productMinQty" type="number" placeholder="1" />
          <div class="hr"></div>

          <div class="label">Imagem do produto</div>
          <input class="input" id="productImage" type="file" accept="image/*" />
          <div style="height:12px"></div>
          <img id="productPreview" style="width:100%;height:220px;object-fit:cover;border-radius:16px;display:none" />
          <div class="hr"></div>

          <button class="btn" id="saveProductBtn">Criar Produto</button>
        </div>
      </div>
    </div>

    <!-- MODAL VARIANTES -->
    <div id="variantModal" class="modal hidden">
      <div class="modal__content">
        <div class="modal__header">
          <h2>Gerenciar Variantes</h2>
          <button id="closeVariantModalBtn" class="modal__close">✕</button>
        </div>
        <div class="modal__body">

          <div class="label">Cor</div>
          <input class="input" id="variantColor" type="text" placeholder="Preto" />
          <div class="hr"></div>

          <div class="label">Tamanho</div>
          <input class="input" id="variantSize" type="text" placeholder="M" />
          <div class="hr"></div>

          <div class="label">Preço</div>
          <input class="input" id="variantPrice" type="number" placeholder="25.90" />
          <div class="hr"></div>

          <div class="label">Estoque</div>
          <input class="input" id="variantStock" type="number" placeholder="100" />
          <div class="hr"></div>

          <div style="display:flex;gap:8px">
            <button class="btn" id="saveVariantBtn">Adicionar Variante</button>
            <button class="btn btn--ghost" id="cancelVariantEditBtn" style="display:none">Cancelar</button>
          </div>

          <div class="hr"></div>
          <div id="variantsList"></div>

        </div>
      </div>
    </div>
  `;

  try {
    const storesResponse = await storesApi.getMyStores();
    const stores = storesResponse.data?.stores || [];
    const store  = stores[0];
    currentStore = store;

    if (!store) {
      document.getElementById('productsGrid').innerHTML =
        `<div class="empty-box">Você ainda não possui loja cadastrada.</div>`;
      return;
    }

    const productsResponse = await productsApi.list(store.id);
    const products = productsResponse.data?.products || [];

    document.getElementById('productsGrid').innerHTML = products.length === 0
      ? `<div class="empty-box">Nenhum produto cadastrado ainda.</div>`
      : products.map(p => productCard(p)).join('');

    setupModal(store, products);
    setupVariants(store, products);
    setupDelete(store);

  } catch (err) {
    console.error(err);
    document.getElementById('productsGrid').innerHTML =
      `<div class="empty-box">Erro ao carregar produtos.</div>`;
  }
}

// ── Card do produto ────────────────────────────────────────────────────────

function productCard(product) {
  const price    = Number(product.priceFrom || 0);
  const variants = product.variants?.length || 0;

  return `
    <div class="dashboard-product-card">
      <div class="dashboard-product-image">
        <img
          src="${product.coverImage || 'https://placehold.co/600x400?text=Produto'}"
          alt="${product.name}"
        />
      </div>
      <div class="dashboard-product-body">
        <h3>${product.name}</h3>
        <p>${product.description || 'Sem descrição'}</p>
        <div class="dashboard-product-meta">
          <span>${brl(price)}</span>
          <span>${variants} variante${variants !== 1 ? 's' : ''}</span>
        </div>
        <div class="dashboard-product-actions">
          <button class="btn btn--ghost manageVariantsBtn" data-product="${product.id}">Variantes</button>
          <button class="btn btn--ghost editProductBtn"    data-product="${product.id}">Editar</button>
          <button class="btn-danger deleteProductBtn"      data-product="${product.id}">Excluir</button>
        </div>
      </div>
    </div>
  `;
}

// ── Modal de produto ───────────────────────────────────────────────────────

function setupModal(store, products) {
  const modal   = document.getElementById('productModal');
  const preview = document.getElementById('productPreview');

  document.getElementById('productImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  });

  // abrir para novo produto
  document.getElementById('newProductBtn').addEventListener('click', () => {
    editingProduct = null;
    clearProductForm();
    document.querySelector('#productModal h2').textContent = 'Novo Produto';
    document.getElementById('saveProductBtn').textContent  = 'Criar Produto';
    modal.classList.remove('hidden');
  });

  // abrir para editar produto
  document.querySelectorAll('.editProductBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = products.find(p => p.id === btn.dataset.product);
      if (!product) return;

      editingProduct = product;

      document.getElementById('productName').value        = product.name        || '';
      document.getElementById('productDescription').value = product.description || '';
      document.getElementById('productPrice').value       = product.priceFrom   || '';
      document.getElementById('productMinQty').value      = product.minQty      || '';

      if (product.coverImage) {
        preview.src = product.coverImage;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }

      document.querySelector('#productModal h2').textContent = 'Editar Produto';
      document.getElementById('saveProductBtn').textContent  = 'Salvar Alterações';
      modal.classList.remove('hidden');
    });
  });

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // salvar produto
  document.getElementById('saveProductBtn').addEventListener('click', async () => {
    const name        = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const priceFrom   = Number(document.getElementById('productPrice').value);
    const minQty      = Number(document.getElementById('productMinQty').value);

    if (!name) { alert('Digite o nome do produto'); return; }

    try {
      const imageFile = document.getElementById('productImage').files[0];
      let coverImage  = editingProduct?.coverImage || null;

      if (imageFile) {
        const upload = await uploadApi.image(imageFile);
        coverImage   = upload.data.secure_url;
      }

      if (editingProduct) {
        await productsApi.update(store.id, editingProduct.id, { name, description, priceFrom, minQty, coverImage });
        alert('Produto atualizado com sucesso');
      } else {
        await productsApi.create(store.id, { name, description, priceFrom, minQty, coverImage });
        alert('Produto criado com sucesso');
      }

      modal.classList.add('hidden');
      renderDashboardProducts();

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar produto');
    }
  });
}

// ── Modal de variantes ─────────────────────────────────────────────────────

function setupVariants(store, products) {
  const modal = document.getElementById('variantModal');

  // abrir modal
  document.querySelectorAll('.manageVariantsBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentProduct   = products.find(p => p.id === btn.dataset.product);
      editingVariantId = null;
      resetVariantForm();
      renderVariants();
      modal.classList.remove('hidden');
    });
  });

  document.getElementById('closeVariantModalBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
    editingVariantId = null;
  });

  // cancelar edição de variante
  document.getElementById('cancelVariantEditBtn').addEventListener('click', () => {
    editingVariantId = null;
    resetVariantForm();
  });

  // salvar variante — cria OU edita dependendo de editingVariantId
  document.getElementById('saveVariantBtn').addEventListener('click', async () => {
    if (!currentProduct) return;

    const color = document.getElementById('variantColor').value.trim();
    const size  = document.getElementById('variantSize').value.trim();
    const price = Number(document.getElementById('variantPrice').value);
    const stock = Number(document.getElementById('variantStock').value);

    if (!price || price <= 0) { alert('Informe um preço válido'); return; }

    try {
      if (editingVariantId) {
        // ── EDITAR variante existente ──────────────────────────────────
        await productsApi.updateVariant(store.id, currentProduct.id, editingVariantId, {
          color, size, price, stock,
        });
      } else {
        // ── CRIAR nova variante ────────────────────────────────────────
        await productsApi.addVariant(store.id, currentProduct.id, { color, size, price, stock });
      }

      // atualiza priceFrom do produto com o menor preço das variantes
      const updated        = await productsApi.list(store.id);
      const updatedProduct = (updated.data?.products || []).find(p => p.id === currentProduct.id);

      if (updatedProduct) {
        const allPrices = updatedProduct.variants.map(v => Number(v.price));
        const minPrice  = Math.min(...allPrices);

        if (minPrice !== Number(updatedProduct.priceFrom)) {
          await productsApi.update(store.id, currentProduct.id, { priceFrom: minPrice });
        }

        currentProduct = updatedProduct;
      }

      editingVariantId = null;
      resetVariantForm();
      renderVariants();

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar variante');
    }
  });
}

// ── Excluir produto ────────────────────────────────────────────────────────

function setupDelete(store) {
  document.querySelectorAll('.deleteProductBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Deseja excluir este produto?')) return;
      try {
        await productsApi.remove(store.id, btn.dataset.product);
        alert('Produto excluído com sucesso');
        renderDashboardProducts();
      } catch (err) {
        alert(err.message || 'Erro ao excluir produto');
      }
    });
  });
}

// ── Lista de variantes ─────────────────────────────────────────────────────

function renderVariants() {
  const list     = document.getElementById('variantsList');
  const variants = currentProduct?.variants || [];

  if (variants.length === 0) {
    list.innerHTML = `<div class="empty-box">Nenhuma variante cadastrada.</div>`;
    return;
  }

  list.innerHTML = variants.map(v => `
    <div class="variant-item">
      <div>
        <strong>${v.color || '-'}</strong> / ${v.size || '-'}
      </div>
      <div>${brl(v.price)}</div>
      <div>Estoque: ${v.stock}</div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn btn--ghost editVariantBtn"  data-variant="${v.id}">Editar</button>
        <button class="btn-danger deleteVariantBtn"    data-variant="${v.id}">Excluir</button>
      </div>
    </div>
  `).join('');

  // editar variante — preenche formulário e seta editingVariantId
  list.querySelectorAll('.editVariantBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const variant = currentProduct.variants.find(v => v.id === btn.dataset.variant);
      if (!variant) return;

      editingVariantId = variant.id;

      document.getElementById('variantColor').value = variant.color || '';
      document.getElementById('variantSize').value  = variant.size  || '';
      document.getElementById('variantPrice').value = variant.price || '';
      document.getElementById('variantStock').value = variant.stock || '';

      document.getElementById('saveVariantBtn').textContent       = 'Salvar Alterações';
      document.getElementById('cancelVariantEditBtn').style.display = 'inline-flex';

      // scroll para o formulário
      document.getElementById('variantColor').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // excluir variante
  list.querySelectorAll('.deleteVariantBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Excluir esta variante?')) return;
      try {
        await productsApi.removeVariant(currentStore.id, currentProduct.id, btn.dataset.variant);

        const updated        = await productsApi.list(currentStore.id);
        const updatedProduct = (updated.data?.products || []).find(p => p.id === currentProduct.id);
        currentProduct       = updatedProduct || currentProduct;

        // atualiza priceFrom após remoção
        if (updatedProduct?.variants?.length > 0) {
          const minPrice = Math.min(...updatedProduct.variants.map(v => Number(v.price)));
          if (minPrice !== Number(updatedProduct.priceFrom)) {
            await productsApi.update(currentStore.id, currentProduct.id, { priceFrom: minPrice });
          }
        }

        editingVariantId = null;
        resetVariantForm();
        renderVariants();

      } catch (err) {
        alert('Erro ao excluir variante');
      }
    });
  });
}

// ── Helpers de formulário ──────────────────────────────────────────────────

function resetVariantForm() {
  document.getElementById('variantColor').value = '';
  document.getElementById('variantSize').value  = '';
  document.getElementById('variantPrice').value = '';
  document.getElementById('variantStock').value = '';
  document.getElementById('saveVariantBtn').textContent         = 'Adicionar Variante';
  document.getElementById('cancelVariantEditBtn').style.display = 'none';
}

function clearProductForm() {
  document.getElementById('productName').value        = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productPrice').value       = '';
  document.getElementById('productMinQty').value      = '';
  document.getElementById('productImage').value       = '';
  document.getElementById('productPreview').style.display = 'none';
}