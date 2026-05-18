// ============================
// utils.js — Utilitários compartilhados
// ============================

export function brl(n) {
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function setActiveNav(routeKey) {
  document.querySelectorAll('.nav a[data-active]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-active') === routeKey);
  });
}

// ============================
// Templates de card
// ============================

export function storeCard(s) {
  return `
    <a class="card" href="#/loja/${s.slug}">
      <div class="cover" style="background-image:url('${s.bannerUrl || s.logoUrl || ''}')"></div>
      <div class="card__body">
        <div class="storeline">
          <div class="avatar" style="background-image:url('${s.logoUrl || s.bannerUrl || ''}')"></div>
          <div style="min-width:0">
            <div class="card__top">
              <h3 class="title">${s.name}</h3>
              ${s.verified ? `<span class="badge">Verificada</span>` : ''}
            </div>
            <p class="muted">${s.city}/${s.state}</p>
          </div>
        </div>
        <p class="muted" style="margin-top:10px">
          Pedido mínimo: <b>${brl(s.minOrderValue)}</b>
        </p>
      </div>
    </a>
  `;
}

export function productCard(p) {
  const image = p.coverImage || p.images?.[0]?.imageUrl || '';
  // slug de busca: precisa do storeId e slug do produto
  const href = `#/loja/${p.store?.slug || p.storeId}/produto/${p.slug}`;
  return `
    <a class="card" href="${href}">
      <div class="cover cover--product" style="background-image:url('${image}')"></div>
      <div class="card__body">
        <h3 class="title">${p.name}</h3>
        <p class="muted">${p.description || ''}</p>
        <p class="price">A partir de <b>${brl(p.priceFrom)}</b></p>
      </div>
    </a>
  `;
}

// ============================
// Toast de notificação
// ============================

export function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}