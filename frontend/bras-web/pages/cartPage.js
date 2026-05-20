// ============================
// pages/cartPage.js
// ============================

import { fetchCart, updateCartItem, removeCartItem, clearCart } from '../cart.js';
import { openWhatsAppFromCart } from '../whatsapp.js';
import { brl, setActiveNav, toast } from '../utils.js';
import { getUser, isLoggedIn } from '../auth.js';
import { ordersApi } from '../api.js';

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

  const cart  = await fetchCart();
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

  const store = normalized[0]?.store;
  const total = normalized.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const user  = getUser();

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

      <!-- Dados do cliente para o pedido -->
      <div id="checkoutForm">
        <p class="label" style="margin-bottom:12px">Dados para o pedido</p>

        <input
          class="input" id="checkoutName"
          type="text" placeholder="Seu nome completo"
          value="${user?.name || ''}"
          style="margin-bottom:10px"
        />

        <input
          class="input" id="checkoutPhone"
          type="tel" placeholder="Seu WhatsApp (ex: 83999999999)"
          style="margin-bottom:10px"
        />

        <textarea
          class="input" id="checkoutNotes"
          rows="2" placeholder="Observações (opcional)"
          style="margin-bottom:10px;resize:none"
        ></textarea>
      </div>

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

  // ── Eventos de quantidade ────────────────────────────────────────────────
  normalized.forEach(item => {
    const el = document.getElementById(`qty_${item.variantId}`);
    if (!el) return;
    el.addEventListener('change', async () => {
      const qty = Number(el.value || 0);
      if (qty <= 0) await removeCartItem(item.variantId);
      else          await updateCartItem(item.variantId, qty);
      renderCart();
    });
  });

  // ── Limpar carrinho ──────────────────────────────────────────────────────
  document.getElementById('clearBtn').addEventListener('click', async () => {
    await clearCart();
    renderCart();
  });

  // ── Checkout: cria pedido → abre WhatsApp ────────────────────────────────
  document.getElementById('waBtn').addEventListener('click', async () => {
    if (!store) {
      alert('Loja não encontrada. Adicione produtos de uma loja ao carrinho.');
      return;
    }

    const customerName  = document.getElementById('checkoutName').value.trim();
    const customerPhone = document.getElementById('checkoutPhone').value.trim();
    const notes         = document.getElementById('checkoutNotes').value.trim();

    if (!customerName)  { toast('Informe seu nome para continuar', 'error'); return; }
    if (!customerPhone) { toast('Informe seu WhatsApp para continuar', 'error'); return; }

    const waBtn      = document.getElementById('waBtn');
    waBtn.disabled   = true;
    waBtn.textContent = 'Registrando pedido...';

    try {
      // 1. Registra o pedido no banco antes de abrir o WhatsApp
      if (isLoggedIn()) {
        await ordersApi.create({
          storeId:       store.id,
          paymentMethod: 'WHATSAPP',
          customerName,
          customerPhone,
          notes: notes || undefined,
        });
      }

      // 2. Abre o WhatsApp com a mensagem formatada
      openWhatsAppFromCart({
        store,
        items: normalized.map(i => ({
          productName: i.productName,
          color:       i.color,
          size:        i.size,
          price:       i.price,
          quantity:    i.quantity,
        })),
        customerName,
      });

    } catch (err) {
      console.error(err);

      const message = err.message || 'Erro ao registrar pedido';

      // Erros de validação do negócio (pedido mínimo, estoque etc.)
      // não devem abrir o WhatsApp — o cliente precisa resolver primeiro
      const isBusinessError = [
        'Minimum order value',
        'Insufficient stock',
        'Cart is empty',
        'No items from this store',
      ].some(s => message.includes(s));

      if (isBusinessError) {
        // Traduz as mensagens mais comuns para português
        const translated = message
          .replace(/Minimum order value is/, 'Valor mínimo do pedido é')
          .replace(/Insufficient stock.*/, 'Estoque insuficiente para um dos produtos')
          .replace(/Cart is empty/, 'Seu carrinho está vazio')
          .replace(/No items from this store.*/, 'Nenhum item desta loja no carrinho');

        toast(translated, 'error');
        return; // não abre WhatsApp
      }

      // Erro inesperado (rede, servidor fora) — abre WhatsApp mesmo assim
      toast('Não foi possível registrar o pedido no sistema, mas o WhatsApp foi aberto.', 'error');

      openWhatsAppFromCart({
        store,
        items: normalized.map(i => ({
          productName: i.productName,
          color:       i.color,
          size:        i.size,
          price:       i.price,
          quantity:    i.quantity,
        })),
        customerName,
      });
    } finally {
      waBtn.disabled    = false;
      waBtn.textContent = '💬 Pedir no WhatsApp';
    }
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