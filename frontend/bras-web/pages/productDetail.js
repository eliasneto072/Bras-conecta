// ============================
// pages/productDetail.js
// ============================

import { storesApi, productsApi } from '../api.js';
import { addToCart } from '../cart.js';
import { brl, toast } from '../utils.js';

export async function renderProductDetail(storeSlug, productSlug) {
  const $app = document.getElementById('app');
  $app.innerHTML = `<p class="muted" style="padding:40px">Carregando produto...</p>`;

  try {
    const storesData = await storesApi.list();
    const store = storesData.data?.stores.find(s => s.slug === storeSlug);
    if (!store) { $app.innerHTML = `<p class="muted">Loja não encontrada.</p>`; return; }

    const productsData = await productsApi.list(store.id);
    const product = productsData.data?.products.find(p => p.slug === productSlug);
    if (!product) { $app.innerHTML = `<p class="muted">Produto não encontrado.</p>`; return; }

    const variants = product.variants || [];
    const coverImage = product.coverImage || product.images?.[0]?.imageUrl || '';

    // monta opções de cor únicas
    const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    // monta opções de tamanho únicas
    const sizes  = [...new Set(variants.map(v => v.size).filter(Boolean))];

    $app.innerHTML = `
      <section class="section" style="max-width:860px;margin:0 auto">
        <div class="box" style="padding:0;overflow:hidden">

          ${coverImage ? `
            <img
              src="${coverImage}"
              alt="${product.name}"
              style="width:100%;max-height:400px;object-fit:cover;display:block"
            />
          ` : ''}

          <div style="padding:24px">

            <h2 class="h2">${product.name}</h2>

            ${product.description
              ? `<p class="p" style="margin-top:8px">${product.description}</p>`
              : ''}

            <!-- Preço dinâmico — atualiza conforme variante selecionada -->
            <p class="price" style="margin-top:16px;font-size:1.4rem">
              <b id="selectedPrice">${brl(product.priceFrom)}</b>
            </p>

            <!-- Seletor de cor -->
            ${colors.length > 0 ? `
              <div style="margin-top:20px">
                <div class="label">Cor</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px" id="colorOptions">
                  ${colors.map(c => `
                    <button
                      class="chip variant-chip"
                      data-color="${c}"
                      style="cursor:pointer"
                    >${c}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Seletor de tamanho -->
            ${sizes.length > 0 ? `
              <div style="margin-top:16px">
                <div class="label">Tamanho</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px" id="sizeOptions">
                  ${sizes.map(s => `
                    <button
                      class="chip variant-chip"
                      data-size="${s}"
                      style="cursor:pointer"
                    >${s}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Estoque da variante selecionada -->
            <p id="stockInfo" class="muted" style="margin-top:12px;font-size:0.85rem"></p>

            <div class="hr"></div>

            <button class="btn2" id="addCartBtn">
              Adicionar ao carrinho
            </button>

          </div>
        </div>
      </section>
    `;

    // ── Lógica de seleção de variante ─────────────────────────────────────

    let selectedColor = colors[0] || null;
    let selectedSize  = sizes[0]  || null;

    function findVariant() {
      // tenta casar cor + tamanho
      return variants.find(v => {
        const colorOk = !colors.length || v.color === selectedColor;
        const sizeOk  = !sizes.length  || v.size  === selectedSize;
        return colorOk && sizeOk;
      }) || variants[0] || null;
    }

    function updateUI() {
      const v = findVariant();

      // preço
      document.getElementById('selectedPrice').textContent =
        brl(v ? v.price : product.priceFrom);

      // estoque
      const stockEl = document.getElementById('stockInfo');
      if (v) {
        stockEl.textContent = v.stock > 0
          ? `${v.stock} unidade${v.stock > 1 ? 's' : ''} disponível`
          : 'Sem estoque';
        stockEl.style.color = v.stock > 0
          ? 'var(--color-text-secondary)'
          : 'var(--color-text-danger, #c0392b)';
      } else {
        stockEl.textContent = '';
      }

      // estado do botão
      const btn = document.getElementById('addCartBtn');
      const semEstoque = v && v.stock === 0;
      btn.disabled = semEstoque;
      btn.textContent = semEstoque ? 'Sem estoque' : 'Adicionar ao carrinho';

      // destaca chips selecionados
      document.querySelectorAll('[data-color]').forEach(el => {
        el.classList.toggle('chip--active', el.dataset.color === selectedColor);
      });
      document.querySelectorAll('[data-size]').forEach(el => {
        el.classList.toggle('chip--active', el.dataset.size === selectedSize);
      });
    }

    // seleciona cor
    document.querySelectorAll('[data-color]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedColor = btn.dataset.color;
        updateUI();
      });
    });

    // seleciona tamanho
    document.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSize = btn.dataset.size;
        updateUI();
      });
    });

    // inicializa UI com primeira variante
    updateUI();

    // ── Adicionar ao carrinho ──────────────────────────────────────────────

    document.getElementById('addCartBtn').addEventListener('click', async () => {
      const variant = findVariant();
      if (!variant) { toast('Selecione uma variante', 'error'); return; }
      if (variant.stock === 0) { toast('Sem estoque disponível', 'error'); return; }

      const btn = document.getElementById('addCartBtn');
      btn.disabled = true;
      btn.textContent = 'Adicionando...';

      try {
        await addToCart(product.id, variant.id, 1);
        toast('Produto adicionado ao carrinho!');
      } catch (err) {
        toast(err.message || 'Erro ao adicionar', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Adicionar ao carrinho';
      }
    });

  } catch (err) {
    $app.innerHTML = `<p class="muted">Erro ao carregar produto.</p>`;
  }
}