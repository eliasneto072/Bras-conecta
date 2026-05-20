// ============================
// pages/dashboard/orders.js
// ============================

import { requireSeller } from '../../auth.js';
import { storesApi, ordersApi } from '../../api.js';
import { brl, toast } from '../../utils.js';

// Mapa de status → label + cor
const STATUS_META = {
  PENDING:    { label: 'Pendente',    color: '#f39c12' },
  CONFIRMED:  { label: 'Confirmado',  color: '#2980b9' },
  PAID:       { label: 'Pago',        color: '#27ae60' },
  SHIPPED:    { label: 'Enviado',     color: '#8e44ad' },
  DELIVERED:  { label: 'Entregue',    color: '#16a085' },
  CANCELED:   { label: 'Cancelado',   color: '#c0392b' },
};

// Transições permitidas por status atual (o que o lojista pode escolher)
const NEXT_STATUSES = {
  PENDING:   ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PAID', 'CANCELED'],
  PAID:      ['SHIPPED'],
  SHIPPED:   ['DELIVERED'],
  DELIVERED: [],
  CANCELED:  [],
};

export async function renderDashboardOrders() {
  if (!requireSeller()) return;

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="dashboard">

      <aside class="dashboard__sidebar">
        <div>
          <h2 class="dashboard__logo">Brás Conecta</h2>
          <nav class="dashboard__nav">
            <a href="#/dashboard">Dashboard</a>
            <a href="#/dashboard/products">Produtos</a>
            <a class="active" href="#/dashboard/orders">Pedidos</a>
            <a href="#/dashboard/settings">Configurações</a>
          </nav>
        </div>
      </aside>

      <main class="dashboard__content">

        <div class="dashboard-page-header">
          <div>
            <h1>Pedidos</h1>
            <p>Gerencie os pedidos recebidos na sua loja</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <select class="input" id="statusFilter" style="width:auto;padding:8px 12px">
              <option value="">Todos os status</option>
              ${Object.entries(STATUS_META).map(([value, { label }]) =>
                `<option value="${value}">${label}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div id="ordersStats" class="dashboard__stats" style="margin-bottom:24px"></div>

        <div id="ordersList">
          <div class="empty-box">Carregando pedidos...</div>
        </div>

      </main>
    </section>

    <!-- MODAL DETALHE DO PEDIDO -->
    <div id="orderModal" class="modal hidden">
      <div class="modal__content modal__content--wide">
        <div class="modal__header">
          <h2 id="orderModalTitle">Pedido</h2>
          <button id="closeOrderModalBtn" class="modal__close">✕</button>
        </div>
        <div class="modal__body" id="orderModalBody"></div>
      </div>
    </div>
  `;

  try {
    const storesRes = await storesApi.getMyStores();
    const store     = (storesRes.data?.stores || [])[0];

    if (!store) {
      document.getElementById('ordersList').innerHTML =
        `<div class="empty-box">Você ainda não possui loja cadastrada.</div>`;
      return;
    }

    const ordersRes = await ordersApi.storeOrders(store.id);
    let orders      = ordersRes.data?.orders || [];

    renderStats(orders);
    renderOrders(orders, store);

    // ── Filtro por status ──────────────────────────────────────────────────
    document.getElementById('statusFilter').addEventListener('change', (e) => {
      const filtered = e.target.value
        ? orders.filter(o => o.status === e.target.value)
        : orders;
      renderOrders(filtered, store);
    });

    // ── Fechar modal ───────────────────────────────────────────────────────
    document.getElementById('closeOrderModalBtn').addEventListener('click', () => {
      document.getElementById('orderModal').classList.add('hidden');
    });

  } catch (err) {
    console.error(err);
    document.getElementById('ordersList').innerHTML =
      `<div class="empty-box">Erro ao carregar pedidos.</div>`;
  }
}

// ── Cards de resumo ────────────────────────────────────────────────────────

function renderStats(orders) {
  const total     = orders.length;
  const pending   = orders.filter(o => o.status === 'PENDING').length;
  const revenue   = orders
    .filter(o => !['CANCELED'].includes(o.status))
    .reduce((acc, o) => acc + Number(o.total), 0);

  document.getElementById('ordersStats').innerHTML = `
    <div class="stat-card">
      <h3>Total</h3>
      <p>${total}</p>
    </div>
    <div class="stat-card">
      <h3>Pendentes</h3>
      <p style="color:#f39c12">${pending}</p>
    </div>
    <div class="stat-card">
      <h3>Faturamento</h3>
      <p>${brl(revenue)}</p>
    </div>
  `;
}

// ── Lista de pedidos ───────────────────────────────────────────────────────

function renderOrders(orders, store) {
  const list = document.getElementById('ordersList');

  if (orders.length === 0) {
    list.innerHTML = `<div class="empty-box">Nenhum pedido encontrado.</div>`;
    return;
  }

  list.innerHTML = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(order => orderRow(order))
    .join('');

  // ── Ver detalhe ──────────────────────────────────────────────────────────
  list.querySelectorAll('.viewOrderBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const order = orders.find(o => o.id === btn.dataset.order);
      if (order) openOrderModal(order, store, orders);
    });
  });
}

function orderRow(order) {
  const meta = STATUS_META[order.status] || { label: order.status, color: '#999' };
  const date = new Date(order.createdAt).toLocaleDateString('pt-BR');
  const items = order.items?.length || 0;

  return `
    <div class="order-row">
      <div class="order-row__info">
        <div class="order-row__id">#${order.id.slice(-6).toUpperCase()}</div>
        <div class="order-row__customer">${order.customerName || 'Cliente'}</div>
        <div class="order-row__date muted">${date}</div>
      </div>
      <div class="order-row__meta">
        <span class="order-row__items muted">${items} item${items !== 1 ? 's' : ''}</span>
        <span class="order-badge" style="background:${meta.color}20;color:${meta.color}">
          ${meta.label}
        </span>
        <span class="order-row__total"><b>${brl(order.total)}</b></span>
        <button class="btn btn--ghost viewOrderBtn" data-order="${order.id}">
          Ver detalhes
        </button>
      </div>
    </div>
  `;
}

// ── Modal de detalhe ───────────────────────────────────────────────────────

function openOrderModal(order, store, allOrders) {
  const modal  = document.getElementById('orderModal');
  const body   = document.getElementById('orderModalBody');
  const meta   = STATUS_META[order.status] || { label: order.status, color: '#999' };
  const nexts  = NEXT_STATUSES[order.status] || [];
  const date   = new Date(order.createdAt).toLocaleString('pt-BR');

  document.getElementById('orderModalTitle').textContent =
    `Pedido #${order.id.slice(-6).toUpperCase()}`;

  body.innerHTML = `

    <!-- Status + data -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <span class="order-badge order-badge--lg" style="background:${meta.color}20;color:${meta.color}">
        ${meta.label}
      </span>
      <span class="muted" style="font-size:13px">${date}</span>
    </div>

    <!-- Atualizar status -->
    ${nexts.length > 0 ? `
      <div class="order-modal-section">
        <div class="label">Atualizar status</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          ${nexts.map(s => `
            <button
              class="btn updateStatusBtn"
              data-order="${order.id}"
              data-status="${s}"
              style="background:${STATUS_META[s]?.color};border-color:${STATUS_META[s]?.color};color:#fff"
            >
              → ${STATUS_META[s]?.label}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="hr"></div>
    ` : ''}

    <!-- Cliente -->
    <div class="order-modal-section">
      <div class="label">Cliente</div>
      <p>${order.customerName || '—'}</p>
      ${order.customerPhone
        ? `<a href="https://wa.me/55${order.customerPhone.replace(/\D/g,'')}" target="_blank" class="btn btn--ghost" style="margin-top:8px;display:inline-flex">
            📱 WhatsApp do cliente
          </a>`
        : ''}
    </div>

    <div class="hr"></div>

    <!-- Endereço -->
    ${order.shippingStreet ? `
      <div class="order-modal-section">
        <div class="label">Endereço de entrega</div>
        <p>
          ${order.shippingStreet}, ${order.shippingNumber || 'S/N'}<br>
          ${order.shippingDistrict ? order.shippingDistrict + ' — ' : ''}
          ${order.shippingCity || ''} / ${order.shippingState || ''}<br>
          ${order.shippingZipCode ? `CEP: ${order.shippingZipCode}` : ''}
        </p>
      </div>
      <div class="hr"></div>
    ` : ''}

    <!-- Itens -->
    <div class="order-modal-section">
      <div class="label">Itens do pedido</div>
      <div style="margin-top:10px">
        ${(order.items || []).map(item => `
          <div class="order-item-row">
            ${item.product?.coverImage
              ? `<img src="${item.product.coverImage}" alt="${item.productName}" class="order-item-img" />`
              : `<div class="order-item-img order-item-img--empty"></div>`}
            <div class="order-item-info">
              <div><b>${item.productName}</b></div>
              ${item.variantLabel ? `<div class="muted" style="font-size:13px">${item.variantLabel}</div>` : ''}
              <div class="muted" style="font-size:13px">${item.quantity}x ${brl(item.unitPrice)}</div>
            </div>
            <div><b>${brl(item.totalPrice)}</b></div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="hr"></div>

    <!-- Totais -->
    <div class="order-modal-section">
      <div style="display:flex;justify-content:space-between"><span class="muted">Subtotal</span><span>${brl(order.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between;margin-top:6px"><span class="muted">Frete</span><span>${brl(order.shippingCost || 0)}</span></div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:1.1rem"><b>Total</b><b>${brl(order.total)}</b></div>
    </div>

    ${order.notes ? `
      <div class="hr"></div>
      <div class="order-modal-section">
        <div class="label">Observações do cliente</div>
        <p>${order.notes}</p>
      </div>
    ` : ''}
  `;

  modal.classList.remove('hidden');

  // ── Botões de atualizar status ───────────────────────────────────────────
  body.querySelectorAll('.updateStatusBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newStatus = btn.dataset.status;
      btn.disabled    = true;
      btn.textContent = 'Atualizando...';

      try {
        await ordersApi.updateStatus(order.id, newStatus);

        // atualiza o objeto local para re-render sem nova requisição
        order.status = newStatus;
        allOrders.find(o => o.id === order.id).status = newStatus;

        toast(`Status atualizado para ${STATUS_META[newStatus]?.label}`);
        modal.classList.add('hidden');

        // re-renderiza a lista e stats com dados atualizados
        renderStats(allOrders);
        renderOrders(
          document.getElementById('statusFilter').value
            ? allOrders.filter(o => o.status === document.getElementById('statusFilter').value)
            : allOrders,
          store
        );

      } catch (err) {
        toast(err.message || 'Erro ao atualizar status', 'error');
        btn.disabled    = false;
        btn.textContent = `→ ${STATUS_META[newStatus]?.label}`;
      }
    });
  });
}