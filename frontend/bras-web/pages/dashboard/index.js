// ============================
// pages/dashboard/index.js
// ============================

import { requireSeller, getUser } from '../../auth.js';
import { storesApi, productsApi, uploadApi } from '../../api.js';
import { brl, toast } from '../../utils.js';

export async function renderDashboard() {
  if (!requireSeller()) return;

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="dashboard">

      <aside class="dashboard__sidebar">
        <div>
          <h2 class="dashboard__logo">Brás Conecta</h2>
          <nav class="dashboard__nav">
            <a class="active" href="#/dashboard">Dashboard</a>
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
          <div class="dashboard__user">${getUser()?.name || 'Usuário'}</div>
        </div>

        <div class="dashboard__stats">
          <div class="stat-card">
            <h3>Produtos</h3>
            <p id="productsCount">—</p>
          </div>
          <div class="stat-card">
            <h3>Pedidos</h3>
            <p id="ordersCount">—</p>
          </div>
          <div class="stat-card">
            <h3>Faturamento</h3>
            <p id="revenue">—</p>
          </div>
        </div>

        <!-- Imagens da loja -->
        <div class="dashboard__section">
          <h2>Imagens da loja</h2>
          <div id="storeImagesBox">Carregando...</div>
        </div>

        <!-- Dados da loja -->
        <div class="dashboard__section">
          <h2>Sua loja</h2>
          <div id="dashboardStoreBox">Carregando...</div>
        </div>

      </main>
    </section>
  `;

  try {
    const response = await storesApi.getMyStores();
    const stores   = response.data?.stores || response.stores || [];
    const store    = stores[0];

    if (!store) {
      document.getElementById('dashboardStoreName').innerText = 'Nenhuma loja cadastrada';
      document.getElementById('dashboardStoreBox').innerHTML  = `<div class="empty-box">Você ainda não possui loja cadastrada.</div>`;
      document.getElementById('storeImagesBox').innerHTML     = '';
      return;
    }

    document.getElementById('dashboardStoreName').innerText = store.name;

    // ── Stats ───────────────────────────────────────────────────────────────
    const productsData = await productsApi.list(store.id);
    const products     = productsData.data?.products || [];
    document.getElementById('productsCount').innerText = products.length;

    // ── Imagens da loja ──────────────────────────────────────────────────────
    renderStoreImages(store);

    // ── Card da loja ─────────────────────────────────────────────────────────
    document.getElementById('dashboardStoreBox').innerHTML = `
      <div class="store-card">
        <h3>${store.name}</h3>
        <p>${store.description || 'Sem descrição'}</p>
        <div class="store-meta">
          <span>${store.city || '-'} / ${store.state || '-'}</span>
          <span>Pedido mínimo: ${brl(store.minOrderValue || 0)}</span>
        </div>
      </div>
    `;

    setupImageUploads(store);

  } catch (err) {
    console.error(err);
    document.getElementById('dashboardStoreName').innerText = 'Erro ao carregar loja';
    document.getElementById('dashboardStoreBox').innerHTML  = `<div class="empty-box">Erro ao carregar dados.</div>`;
  }
}

// ── Renderiza preview das imagens atuais + inputs de upload ────────────────

function renderStoreImages(store) {
  document.getElementById('storeImagesBox').innerHTML = `
    <div class="store-images-grid">

      <!-- Logo -->
      <div class="store-image-item">
        <div class="label">Logo da loja</div>
        <div class="store-image-preview" id="logoPreviewWrap">
          ${store.logoUrl
            ? `<img id="logoPreview" src="${store.logoUrl}" alt="Logo" />`
            : `<div id="logoPreview" class="store-image-empty">Sem logo</div>`}
        </div>
        <label class="btn btn--ghost btn--upload" style="margin-top:10px">
          Alterar logo
          <input type="file" id="logoInput" accept="image/*" style="display:none" />
        </label>
        <span id="logoStatus" class="upload-status"></span>
      </div>

      <!-- Banner -->
      <div class="store-image-item">
        <div class="label">Banner da loja</div>
        <div class="store-image-preview store-image-preview--banner" id="bannerPreviewWrap">
          ${store.bannerUrl
            ? `<img id="bannerPreview" src="${store.bannerUrl}" alt="Banner" />`
            : `<div id="bannerPreview" class="store-image-empty">Sem banner</div>`}
        </div>
        <label class="btn btn--ghost btn--upload" style="margin-top:10px">
          Alterar banner
          <input type="file" id="bannerInput" accept="image/*" style="display:none" />
        </label>
        <span id="bannerStatus" class="upload-status"></span>
      </div>

    </div>
  `;
}

// ── Lógica de upload ───────────────────────────────────────────────────────

function setupImageUploads(store) {

  // helper genérico para os dois campos
  async function handleUpload({ inputId, previewId, statusId, field }) {
    const input  = document.getElementById(inputId);
    const status = document.getElementById(statusId);

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // preview imediato antes mesmo do upload
      const objectUrl = URL.createObjectURL(file);
      const preview   = document.getElementById(previewId);
      if (preview.tagName === 'IMG') {
        preview.src = objectUrl;
      } else {
        // era o placeholder — troca por img
        const img  = document.createElement('img');
        img.id     = previewId;
        img.src    = objectUrl;
        preview.replaceWith(img);
      }

      status.textContent = 'Enviando...';
      status.className   = 'upload-status upload-status--loading';

      try {
        const upload   = await uploadApi.image(file);
        const imageUrl = upload.data.secure_url;

        await storesApi.update(store.id, { [field]: imageUrl });

        store[field]       = imageUrl; // atualiza local para re-renders
        status.textContent = 'Salvo com sucesso!';
        status.className   = 'upload-status upload-status--ok';

        toast(`${field === 'logoUrl' ? 'Logo' : 'Banner'} atualizado!`);

      } catch (err) {
        status.textContent = err.message || 'Erro ao enviar';
        status.className   = 'upload-status upload-status--error';
        toast(err.message || 'Erro ao enviar imagem', 'error');
      }

      setTimeout(() => { status.textContent = ''; }, 4000);
    });
  }

  handleUpload({ inputId: 'logoInput',   previewId: 'logoPreview',   statusId: 'logoStatus',   field: 'logoUrl'   });
  handleUpload({ inputId: 'bannerInput', previewId: 'bannerPreview', statusId: 'bannerStatus', field: 'bannerUrl' });
}