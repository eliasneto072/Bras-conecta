// ============================
// app.js — Entry point + Router
// ============================

import { renderHome }        from './pages/home.js';
import { renderStores }      from './pages/stores.js';
import { renderStoreDetail } from './pages/storeDetail.js';
import { renderProductDetail }from './pages/productDetail.js';
import { renderCart }        from './pages/cartPage.js';
import { renderLogin }       from './pages/login.js';
import { renderDashboard }         from './pages/dashboard/index.js';
import { renderDashboardProducts } from './pages/dashboard/products.js';
import { renderDashboardOrders }   from './pages/dashboard/orders.js';
import { renderMyOrders }          from './pages/myOrders.js';
import { updateCartBadge }   from './cart.js';
import { isLoggedIn, isSeller, getUser, logout } from './auth.js';

// ============================
// Header dinâmico
// ============================

function updateHeader() {
  const user = getUser();
  const nav  = document.querySelector('.nav');
  if (!nav) return;

  const dashLink = isLoggedIn()
    ? `
      ${isSeller()
        ? `<a class="btn" href="#/dashboard">Painel</a>`
        : `<a class="btn btn--ghost" href="#/pedidos">Meus Pedidos</a>`}
      <button class="btn btn--ghost" id="logoutBtn" style="cursor:pointer">${user?.name?.split(' ')[0] || 'Sair'} ✕</button>`
    : `<a class="btn" href="#/login">Entrar</a>`;

  nav.innerHTML = `
    <a href="#/lojas" data-active="lojas">Lojas</a>
    <a href="#/carrinho" data-active="carrinho">
      Carrinho <span id="cartBadge" class="badge badge--dark">0</span>
    </a>
    ${dashLink}
  `;

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Deseja sair?')) logout();
  });

  updateCartBadge();
}

// ============================
// Footer
// ============================

const $year = document.getElementById('year');
if ($year) $year.textContent = new Date().getFullYear();

// ============================
// Router
// ============================

function parseRoute() {
  const hash  = location.hash || '#/';
  const clean = hash.replace(/^#/, '');
  return clean.split('/').filter(Boolean);
}

async function route() {
  updateHeader();

  const parts = parseRoute();

  if (parts.length === 0)                              return renderHome();
  if (parts[0] === 'lojas' && parts.length === 1)      return renderStores();
  if (parts[0] === 'loja'  && parts[1] && !parts[2])  return renderStoreDetail(parts[1]);

  // /loja/:storeSlug/produto/:productSlug
  if (parts[0] === 'loja' && parts[1] && parts[2] === 'produto' && parts[3])
    return renderProductDetail(parts[1], parts[3]);

  if (parts[0] === 'carrinho') return renderCart();
  if (parts[0] === 'pedidos')   return renderMyOrders();
  if (parts[0] === 'login')    return renderLogin();

  if (parts[0] === 'dashboard') {
    if (parts[1] === 'products') return renderDashboardProducts();
    if (parts[1] === 'orders')   return renderDashboardOrders();
    return renderDashboard();
  }

  return renderNotFound();
}

function renderNotFound() {
  document.getElementById('app').innerHTML = `
    <section class="section">
      <h2 class="h2">Página não encontrada</h2>
      <p class="p">Voltar para <a class="link" href="#/">Home</a>.</p>
    </section>
  `;
}

// ============================
// Boot
// ============================

window.addEventListener('hashchange', route);
route();