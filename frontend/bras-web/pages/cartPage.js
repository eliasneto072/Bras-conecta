// ============================
// pages/cartPage.js
// ============================

import { fetchCart, updateCartItem, removeCartItem, clearCart } from '../cart.js';
import { openWhatsAppFromCart } from '../whatsapp.js';
import { brl, setActiveNav } from '../utils.js';
import { getUser } from '../auth.js';

export async function renderCart() {
  setActiveNav('carrinho');
  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="section">
      <div class="section__head">
        <h2 class="h2">Carrinho</h2>
      </div>
      <div id="cartContent">
        <p class="muted">Carregando...</p>
      </div>
    </section>
  `;

  const cart = await fetchCart();
  const items = cart?.items || [];

  if (items.length === 0) {
    document.getElementById('cartContent').innerHTML = `
      <div class="empty">
        <div class="empty__img"></div>
        <div>
          <p class="p" style="margin:0">Seu carrinho está vazio.</p>
          <p class="p" style="margin-top:6px">Explore as lojas e monte seu pedido.</p>
          <div style="margin-top:10px">
            <a class="btn" href="#/lojas">Ver lojas</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // normaliza itens vindos da API ou localStorage
  const normalized = items.map(i => ({
    productId:   i.productId,
    variantId:   i.variantId,
    quantity:    i.quantity ?? i.qty,
    productName: i.product?.name ?? i.productName ?? '—',
    color:       i.variant?.color ?? i.color ?? null,
    size:        i.variant?.size  ?? i.size  ?? null,
    price:       Number(i.variant?.price ?? i.price ?? 0),
    coverImage:  i.product?.coverImage ?? null,
    store:       i.product?.store ?? null,
  }));

  const store  = normalized[0]?.store;
  const total  = normalized.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const user   = getUser();

  document.getElementById('cartContent').innerHTML = `
    <div class="box">
      ${normalized.map(cartRow).join('')}

      <div class="hr"></div>

      <div class="cart-row">
        <div class="cart-row__left"><p class="muted">Total</p></div>
        <div class="cart-row__right">
          <p style="margin:0; font-weight:800">${brl(total)}</p>
        </div>
      </div>

      <div class="hr"></div>

      <button class="btn2" id="waBtn">💬 Pedir no WhatsApp</button>
      <div style="height:10px"></div>
      <button class="btn3" id="clearBtn">Limpar carrinho</button>

      ${store ? `
        <p class="small" style="margin-top:10px">
          Loja: <b>${store.name}</b> • WhatsApp: <b>${store.whatsapp}</b>
        </p>
      ` : ''}
    </div>
  `;

  // eventos de quantidade
  normalized.forEach(item => {
    const id = `qty_${item.variantId}`;
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', async () => {
      const qty = Number(el.value || 0);
      if (qty <= 0) {
        await removeCartItem(item.variantId);
      } else {
        await updateCartItem(item.variantId, qty);
      }
      renderCart();
    });
  });

  // limpar carrinho
  document.getElementById('clearBtn').addEventListener('click', async () => {
    await clearCart();
    renderCart();
  });

  // WhatsApp
  document.getElementById('waBtn').addEventListener('click', () => {
    if (!store) {
      alert('Loja não encontrada. Adicione produtos de uma loja ao carrinho.');
      return;
    }

    openWhatsAppFromCart({
      store,
      items: normalized.map(i => ({
        productName: i.productName,
        color:       i.color,
        size:        i.size,
        price:       i.price,
        quantity:    i.quantity,
      })),
      customerName: user?.name ?? null,
    });
  });
}

function cartRow(item) {
  const label    = [item.color, item.size].filter(Boolean).join(' / ');
  const lineTotal = brl(item.price * item.quantity);
  return `
    <div class="cart-row">
      <div class="cart-row__left">
        <p style="margin:0; font-weight:800">${item.productName}</p>
        <p class="small">${label ? label + ' • ' : ''}${brl(item.price)}</p>
      </div>
      <div class="cart-row__right">
        <input
          class="input"
          style="width:84px"
          id="qty_${item.variantId}"
          type="number"
          min="0"
          value="${item.quantity}"
        />
        <p style="margin:0; width:120px; text-align:right; font-weight:800">
          ${lineTotal}
        </p>
      </div>
    </div>
  `;
}