// ============================
// pages/myOrders.js
// ============================

import { requireAuth } from '../auth.js';
import { ordersApi }   from '../api.js';
import { brl, toast }  from '../utils.js';

const STATUS_META = {
  PENDING:   { label: 'Pendente',    color: '#f39c12' },
  CONFIRMED: { label: 'Confirmado',  color: '#2980b9' },
  PAID:      { label: 'Pago',        color: '#27ae60' },
  SHIPPED:   { label: 'Enviado',     color: '#8e44ad' },
  DELIVERED: { label: 'Entregue',    color: '#16a085' },
  CANCELED:  { label: 'Cancelado',   color: '#c0392b' },
};

export async function renderMyOrders() {
  if (!requireAuth()) return;

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="section">
      <div class="section__head">
        <h2 class="h2">Meus Pedidos</h2>
      </div>
      <div id="myOrdersList">
        <p class="muted">Carregando pedidos...</p>
      </div>
    </section>
  `;

  try {
    const res    = await ordersApi.myOrders();
    const orders = res.data?.orders || [];

    if (orders.length === 0) {
      document.getElementById('myOrdersList').innerHTML =
        `<div class="empty-box">Você ainda não fez nenhum pedido.</div>`;
      return;
    }

    renderOrders(orders);

  } catch (err) {
    document.getElementById('myOrdersList').innerHTML =
      `<div class="empty-box">Erro ao carregar pedidos.</div>`;
  }
}

function renderOrders(orders) {
  const list = document.getElementById('myOrdersList');

  list.innerHTML = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(order => orderCard(order))
    .join('');

  // Botão confirmar recebimento
  list.querySelectorAll('.confirmDeliveryBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Confirmar que você recebeu este pedido?')) return;

      btn.disabled    = true;
      btn.textContent = 'Confirmando...';

      try {
        await ordersApi.updateStatus(btn.dataset.order, 'DELIVERED');
        toast('Recebimento confirmado!');
        // atualiza o card sem recarregar tudo
        const card = btn.closest('.my-order-card');
        const badge = card.querySelector('.order-badge');
        const meta  = STATUS_META['DELIVERED'];
        badge.textContent  = meta.label;
        badge.style.background = `${meta.color}20`;
        badge.style.color      = meta.color;
        btn.remove();
      } catch (err) {
        toast(err.message || 'Erro ao confirmar recebimento', 'error');
        btn.disabled    = false;
        btn.textContent = '✓ Confirmar recebimento';
      }
    });
  });
}

function orderCard(order) {
  const meta  = STATUS_META[order.status] || { label: order.status, color: '#999' };
  const date  = new Date(order.createdAt).toLocaleDateString('pt-BR');
  const items = order.items || [];

  return `
    <div class="my-order-card box" style="margin-bottom:16px">

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <span class="muted" style="font-size:13px;font-family:monospace">
            #${order.id.slice(-6).toUpperCase()}
          </span>
          <span class="muted" style="font-size:13px;margin-left:12px">${date}</span>
        </div>
        <span class="order-badge" style="background:${meta.color}20;color:${meta.color}">
          ${meta.label}
        </span>
      </div>

      <div class="hr"></div>

      <div style="font-size:14px;margin-bottom:4px">
        <b>${order.store?.name || 'Loja'}</b>
      </div>

      ${items.map(item => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
          <div>
            <span>${item.productName}</span>
            ${item.variantLabel
              ? `<span class="muted" style="font-size:12px"> • ${item.variantLabel}</span>`
              : ''}
          </div>
          <span class="muted" style="font-size:13px">${item.quantity}x ${brl(item.unitPrice)}</span>
        </div>
      `).join('')}

      <div style="display:flex;justify-content:space-between;margin-top:12px">
        <span class="muted">Total</span>
        <b>${brl(order.total)}</b>
      </div>

      ${order.status === 'SHIPPED' ? `
        <div class="hr"></div>
        <button
          class="btn confirmDeliveryBtn"
          data-order="${order.id}"
          style="width:100%"
        >
          ✓ Confirmar recebimento
        </button>
      ` : ''}

    </div>
  `;
}