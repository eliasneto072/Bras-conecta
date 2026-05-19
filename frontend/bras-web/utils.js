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
      <div class="cover" style="background-image:url('${s.bannerUrl || s.logoUrl || ''}')">
        <div class="card__overlay">
          <span class="card__overlay-label">Ver loja →</span>
        </div>
      </div>
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
  const href = `#/loja/${p.store?.slug || p.storeId}/produto/${p.slug}`;
  return `
    <a class="card" href="${href}">
      <div class="cover cover--product" style="background-image:url('${image}')">
        <div class="card__overlay">
          <span class="card__overlay-label">Ver produto →</span>
        </div>
        <span class="card__price-badge">A partir de ${brl(p.priceFrom)}</span>
      </div>
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
  setTimeout(() => {
    el.classList.add('hiding');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2700);
}

export function cartBounce() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.classList.remove('bounce');
  void badge.offsetWidth;
  badge.classList.add('bounce');
  badge.addEventListener('animationend', () => badge.classList.remove('bounce'), { once: true });
}

// ============================
// Skeleton helpers (Etapa 1)
// ============================

export function skeletonStoreCards(n = 3) {
  return Array(n).fill(`
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-cover skeleton-block"></div>
      <div class="skeleton-body">
        <div class="skeleton-storeline">
          <div class="skeleton-avatar skeleton-block"></div>
          <div class="skeleton-storeline-info">
            <div class="skeleton-line skeleton-block"></div>
            <div class="skeleton-line skeleton-line--sm skeleton-block"></div>
          </div>
        </div>
        <div class="skeleton-line skeleton-line--xs skeleton-block" style="margin-top:8px"></div>
      </div>
    </div>
  `).join('');
}

export function skeletonProductCards(n = 6) {
  return Array(n).fill(`
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-cover skeleton-cover--product skeleton-block"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-block"></div>
        <div class="skeleton-line skeleton-line--sm skeleton-block"></div>
        <div class="skeleton-line skeleton-line--sm skeleton-block"></div>
        <div class="skeleton-line skeleton-line--xs skeleton-block" style="margin-top:4px"></div>
      </div>
    </div>
  `).join('');
}

export function skeletonDashboardCards(n = 4) {
  return Array(n).fill(`
    <div class="skeleton-card dashboard-product-card" aria-hidden="true">
      <div class="skeleton-cover skeleton-cover--product skeleton-block"></div>
      <div class="skeleton-body" style="padding:20px">
        <div class="skeleton-line skeleton-block"></div>
        <div class="skeleton-line skeleton-line--sm skeleton-block"></div>
        <div class="skeleton-line skeleton-line--sm skeleton-block"></div>
        <div class="skeleton-line skeleton-block" style="margin-top:12px"></div>
      </div>
    </div>
  `).join('');
}