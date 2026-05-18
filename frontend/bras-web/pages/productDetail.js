import { storesApi, productsApi } from '../api.js';
import { addToCart } from '../cart.js';
import { brl } from '../utils.js';

export async function renderProductDetail(storeSlug, productSlug) {
  const $app = document.getElementById('app');

  $app.innerHTML = `<p>Carregando produto...</p>`;

  try {

    const storesData = await storesApi.list();

    const store = storesData.data?.stores.find(
      s => s.slug === storeSlug
    );

    if (!store) {
      $app.innerHTML = `<p>Loja não encontrada.</p>`;
      return;
    }

    const productsData = await productsApi.list(store.id);

    const product = productsData.data?.products.find(
      p => p.slug === productSlug
    );

    if (!product) {
      $app.innerHTML = `<p>Produto não encontrado.</p>`;
      return;
    }

    const variant = product.variants?.[0] || {
    id: product.id,
    price: product.priceFrom
    };

    $app.innerHTML = `
      <section class="section">
        <div class="box">

          <h2 class="h2">${product.name}</h2>

          <p class="p">
            ${product.description || ''}
          </p>

          <h3>
            ${brl(variant?.price || product.priceFrom || 0)}
          </h3>

          <button class="btn2" id="addCartBtn">
            Adicionar ao carrinho
          </button>

        </div>
      </section>
    `;

    document
      .getElementById('addCartBtn')
      .addEventListener('click', async () => {

        await addToCart(
          product.id,
          variant?.id,
          1
        );

        alert('Produto adicionado!');
      });

  } catch (err) {
    $app.innerHTML = `
      <p>Erro ao carregar produto.</p>
    `;
  }
}