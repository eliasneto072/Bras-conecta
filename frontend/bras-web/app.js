// ============================
// Mock Data (troca por API depois)
// ============================
const stores = [
  {
    id: "s1",
    name: "Loja Brás Premium",
    slug: "loja-bras-premium",
    city: "São Paulo",
    state: "SP",
    whatsapp: "5511999999999",
    minOrderValue: 300,
    verified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1521332154212-9c3a603f05a8?auto=format&fit=crop&w=1600&q=60",
    logoUrl:
      "https://images.unsplash.com/photo-1520975693415-35a8a79a3e9a?auto=format&fit=crop&w=256&q=60",
  },
  {
    id: "s2",
    name: "Moda Fitness Brás",
    slug: "moda-fitness-bras",
    city: "São Paulo",
    state: "SP",
    whatsapp: "5511988888888",
    minOrderValue: 200,
    verified: false,
    coverUrl:
      "https://images.unsplash.com/photo-1520975958229-71d31a93aaf5?auto=format&fit=crop&w=1600&q=60",
    logoUrl:
      "https://images.unsplash.com/photo-1520975688268-3eeef8d7d6cf?auto=format&fit=crop&w=256&q=60",
  },
  {
    id: "s3",
    name: "Jeans do Brás",
    slug: "jeans-do-bras",
    city: "São Paulo",
    state: "SP",
    whatsapp: "5511977777777",
    minOrderValue: 250,
    verified: true,
    coverUrl:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1600&q=60",
    logoUrl:
      "https://images.unsplash.com/photo-1520975912094-79a5c4b6c88f?auto=format&fit=crop&w=256&q=60",
  },
];

const products = [
  {
    id: "p1",
    storeId: "s1",
    name: "Conjunto Feminino Premium",
    slug: "conjunto-feminino-premium",
    description:
      "Conjunto atacado com ótimo caimento. Ideal para revenda. Grade completa.",
    category: "Moda Feminina",
    priceFrom: 49.9,
    minQty: 6,
    images: [
      "https://images.unsplash.com/photo-1520975912094-79a5c4b6c88f?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1520975708798-6da5f4d0c6c9?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1520975688268-3eeef8d7d6cf?auto=format&fit=crop&w=1200&q=60",
    ],
    variants: [
      { id: "v1", color: "Preto", size: "P", price: 49.9, stock: 30 },
      { id: "v2", color: "Preto", size: "M", price: 49.9, stock: 25 },
      { id: "v3", color: "Preto", size: "G", price: 49.9, stock: 15 },
    ],
  },
  {
    id: "p2",
    storeId: "s2",
    name: "Legging Fitness Atacado",
    slug: "legging-fitness-atacado",
    description:
      "Legging com tecido premium, excelente elasticidade. Ótima saída.",
    category: "Fitness",
    priceFrom: 29.9,
    minQty: 10,
    images: [
      "https://images.unsplash.com/photo-1520975688268-3eeef8d7d6cf?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1520975708798-6da5f4d0c6c9?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1520975912094-79a5c4b6c88f?auto=format&fit=crop&w=1200&q=60",
    ],
    variants: [
      { id: "v4", color: "Grafite", size: "M", price: 29.9, stock: 50 },
      { id: "v5", color: "Grafite", size: "G", price: 29.9, stock: 40 },
    ],
  },
  {
    id: "p3",
    storeId: "s3",
    name: "Calça Jeans Atacado",
    slug: "calca-jeans-atacado",
    description:
      "Jeans com ótima saída, lavagem moderna. Ideal pra revenda em volume.",
    category: "Jeans",
    priceFrom: 59.9,
    minQty: 6,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1520975958229-71d31a93aaf5?auto=format&fit=crop&w=1200&q=60",
      "https://images.unsplash.com/photo-1520975912094-79a5c4b6c88f?auto=format&fit=crop&w=1200&q=60",
    ],
    variants: [
      { id: "v6", color: "Azul", size: "38", price: 59.9, stock: 40 },
      { id: "v7", color: "Azul", size: "40", price: 59.9, stock: 30 },
    ],
  },
];

// ============================
// DOM
// ============================
const $app = document.getElementById("app");
const $year = document.getElementById("year");
const $cartBadge = document.getElementById("cartBadge");
$year.textContent = new Date().getFullYear();

// ============================
// Utils
// ============================
function brl(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function setActiveNav(routeKey) {
  document.querySelectorAll(".nav a[data-active]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-active") === routeKey);
  });
}

// ============================
// Cart (localStorage)
// ============================
const CART_KEY = "bras_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}
function updateCartBadge() {
  const items = getCart();
  const totalQty = items.reduce((acc, i) => acc + i.qty, 0);
  $cartBadge.textContent = String(totalQty);
}
function addToCart(productId, variantId, qty) {
  const items = getCart();
  const idx = items.findIndex(
    (i) => i.productId === productId && i.variantId === variantId
  );
  if (idx >= 0) items[idx].qty += qty;
  else items.push({ productId, variantId, qty });
  setCart(items);
}
function updateQty(productId, variantId, qty) {
  const items = getCart()
    .map((i) =>
      i.productId === productId && i.variantId === variantId
        ? { ...i, qty }
        : i
    )
    .filter((i) => i.qty > 0);
  setCart(items);
}
function clearCart() {
  setCart([]);
}

// ============================
// WhatsApp
// ============================
function openWhatsApp(phone, text) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noreferrer");
}

// ============================
// Router
// ============================
function parseRoute() {
  const hash = location.hash || "#/";
  const clean = hash.replace(/^#/, "");
  const parts = clean.split("/").filter(Boolean);
  return parts;
}

function route() {
  const parts = parseRoute();

  if (parts.length === 0) return renderHome();

  if (parts[0] === "lojas" && parts.length === 1) return renderStores();
  if (parts[0] === "loja" && parts[1]) return renderStoreDetail(parts[1]);

  if (parts[0] === "produto" && parts[1]) return renderProductDetail(parts[1]);

  if (parts[0] === "carrinho") return renderCart();

  if (parts[0] === "dashboard") return renderDashboard();

  return renderNotFound();
}

// ============================
// Views
// ============================
function renderHome() {
  setActiveNav(null);

  const featuredStores = stores.slice(0, 3);
  const hotProducts = products.slice(0, 6);

  $app.innerHTML = `
    <section class="hero">
      <div class="hero__grid">
        <div>
          <h1 class="h1">Encontre atacado do Brás sem caos de catálogo no WhatsApp</h1>
          <p class="p">Navegue por lojas, produtos e monte seu pedido. Depois, finalize direto no WhatsApp.</p>

          <div class="hero__actions">
            <a class="btn" href="#/lojas">Ver lojas</a>
            <a class="btn btn--ghost" href="#/carrinho">Abrir carrinho</a>
          </div>

          <div class="hero__chips">
            <span class="chip">Atacado</span>
            <span class="chip">Pedido mínimo</span>
            <span class="chip">WhatsApp</span>
            <span class="chip">Lançamentos</span>
          </div>
        </div>

        <div class="hero__image" aria-hidden="true"></div>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="h2">Lojas em destaque</h2>
        <a class="link" href="#/lojas">Ver todas</a>
      </div>
      <div class="grid cols-3">
        ${featuredStores.map(storeCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="h2">Produtos em alta</h2>
      </div>
      <div class="grid cols-3">
        ${hotProducts.map(productCard).join("")}
      </div>
    </section>
  `;
}

function renderStores() {
  setActiveNav("lojas");

  $app.innerHTML = `
    <section class="section">
      <div class="section__head">
        <h2 class="h2">Lojas</h2>
      </div>
      <div class="grid cols-3">
        ${stores.map(storeCard).join("")}
      </div>
    </section>
  `;
}

function renderStoreDetail(slug) {
  setActiveNav("lojas");

  const store = stores.find((s) => s.slug === slug);
  if (!store) return renderNotFound();

  const storeProducts = products.filter((p) => p.storeId === store.id);

  $app.innerHTML = `
    <section class="panel">
      <div class="panel__cover" style="background-image:url('${store.coverUrl || ""}')"></div>
      <div class="panel__body">
        <h1 class="h1" style="font-size:24px">${store.name}</h1>
        <p class="p" style="margin-top:8px">
          ${store.city}/${store.state} • WhatsApp: <b>${store.whatsapp}</b>
          ${store.verified ? ` • <span class="badge">Verificada</span>` : ""}
        </p>
        <p class="p" style="margin-top:6px">
          Pedido mínimo por loja: <b>${brl(store.minOrderValue)}</b>
        </p>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <h2 class="h2">Produtos</h2>
      </div>
      <div class="grid cols-3">
        ${storeProducts.map(productCard).join("")}
      </div>
    </section>
  `;
}

function renderProductDetail(slug) {
  setActiveNav(null);

  const product = products.find((p) => p.slug === slug);
  if (!product) return renderNotFound();

  const store = stores.find((s) => s.id === product.storeId);
  const firstVariant = product.variants[0];

  $app.innerHTML = `
    <section class="row" style="margin-top:24px">
      <div class="col">
        <div class="panel">
          <div class="panel__cover" style="background-image:url('${product.images?.[0] || ""}'); height:320px"></div>

          <div class="thumbs">
            ${product.images.slice(0,3).map(img => `
              <div class="thumb" style="background-image:url('${img}')"></div>
            `).join("")}
          </div>

          <div class="panel__body">
            <h1 class="h1" style="font-size:24px">${product.name}</h1>
            <p class="p">${product.description}</p>
            <p class="p" style="margin-top:8px">
              Categoria: <b>${product.category}</b><br/>
              Vendido por: <a class="link" href="#/loja/${store?.slug}">${store?.name || "-"}</a>
            </p>
          </div>
        </div>
      </div>

      <div class="col">
        <div class="box">
          <div class="label">Variação</div>
          <select id="variantSelect">
            ${product.variants
              .map(
                (v) =>
                  `<option value="${v.id}">${v.color} • ${v.size} — ${brl(v.price)}</option>`
              )
              .join("")}
          </select>

          <div class="hr"></div>

          <div class="label">Quantidade ${product.minQty ? `(mín. ${product.minQty})` : ""}</div>
          <input class="input" id="qtyInput" type="number" min="${product.minQty || 1}" value="${product.minQty || 1}" />

          <div class="hr"></div>

          <button class="btn2" id="addBtn">Adicionar ao carrinho</button>

          <p class="small" style="margin-top:10px">
            Estoque (mock): <span id="stockSpan">${firstVariant?.stock ?? "-"}</span>
          </p>

          <div class="hr"></div>

          <a class="btn3" href="#/carrinho">Ir para o carrinho</a>
        </div>
      </div>
    </section>
  `;

  const variantSelect = document.getElementById("variantSelect");
  const qtyInput = document.getElementById("qtyInput");
  const addBtn = document.getElementById("addBtn");
  const stockSpan = document.getElementById("stockSpan");

  variantSelect.addEventListener("change", () => {
    const v = product.variants.find((x) => x.id === variantSelect.value);
    stockSpan.textContent = v ? String(v.stock) : "-";
  });

  addBtn.addEventListener("click", () => {
    const variantId = variantSelect.value;
    const qty = Number(qtyInput.value || 1);
    const min = product.minQty || 1;

    if (qty < min) {
      alert(`Quantidade mínima para este produto: ${min}`);
      qtyInput.value = String(min);
      return;
    }

    addToCart(product.id, variantId, qty);
    alert("Adicionado ao carrinho!");
  });
}

function renderCart() {
  setActiveNav("carrinho");

  const items = getCart();
  if (items.length === 0) {
    $app.innerHTML = `
      <section class="section">
        <h2 class="h2">Carrinho</h2>

        <div class="empty">
          <div class="empty__img"></div>
          <div>
            <p class="p" style="margin:0">Seu carrinho está vazio.</p>
            <p class="p" style="margin-top:6px">Explore as lojas e monte seu pedido em poucos cliques.</p>
            <div style="margin-top:10px">
              <a class="btn" href="#/lojas">Ver lojas</a>
            </div>
          </div>
        </div>
      </section>
    `;
    return;
  }

  const rows = items.map((i) => {
    const product = products.find((p) => p.id === i.productId);
    const variant = product?.variants.find((v) => v.id === i.variantId);
    return { ...i, product, variant };
  });

  const storeId = rows[0]?.product?.storeId;
  const store = stores.find((s) => s.id === storeId);

  const total = rows.reduce((acc, r) => acc + (r.variant?.price || 0) * r.qty, 0);

  const messageLines = rows.map(
    (r) =>
      `- ${r.product.name} (${r.variant.color}/${r.variant.size}) x${r.qty} — ${brl(r.variant.price)}`
  );
  const message = `Olá! Quero fazer um pedido:\n${messageLines.join("\n")}\n\nTotal estimado: ${brl(total)}`;

  $app.innerHTML = `
    <section class="section">
      <div class="section__head">
        <h2 class="h2">Carrinho</h2>
      </div>

      <div class="box">
        ${rows.map(cartRow).join("")}

        <div class="hr"></div>

        <div class="cart-row">
          <div class="cart-row__left">
            <p class="muted">Total</p>
          </div>
          <div class="cart-row__right">
            <p style="margin:0; font-weight:800">${brl(total)}</p>
          </div>
        </div>

        <div class="hr"></div>

        <button class="btn2" id="waBtn">Pedir no WhatsApp</button>
        <div style="height:10px"></div>
        <button class="btn3" id="clearBtn">Limpar carrinho</button>

        <p class="small" style="margin-top:10px">
          Loja: <b>${store?.name || "-"}</b> • WhatsApp: <b>${store?.whatsapp || "-"}</b>
        </p>
      </div>
    </section>
  `;

  rows.forEach((r) => {
    const id = `qty_${r.productId}_${r.variantId}`;
    const el = document.getElementById(id);
    el.addEventListener("change", () => {
      updateQty(r.productId, r.variantId, Number(el.value || 0));
      renderCart();
    });
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    clearCart();
    renderCart();
  });

  document.getElementById("waBtn").addEventListener("click", () => {
    if (!store) return alert("Loja não encontrada para finalizar.");
    openWhatsApp(store.whatsapp, message);
  });
}

function renderDashboard() {
  setActiveNav(null);
  $app.innerHTML = `
    <section class="section">
      <h2 class="h2">Painel do lojista</h2>
      <p class="p">Placeholder do dashboard. Depois você conecta login e cria CRUD de produtos/pedidos.</p>

      <div class="row" style="margin-top:14px">
        <div class="col">
          <div class="box">
            <h3 class="title">Próximas telas</h3>
            <p class="muted">- Login do lojista</p>
            <p class="muted">- Cadastro/edição de produtos</p>
            <p class="muted">- Listagem de pedidos</p>
            <p class="muted">- Status do pedido</p>
          </div>
        </div>
        <div class="col">
          <div class="box">
            <h3 class="title">Pronto para API</h3>
            <p class="muted">Substitua os arrays mock por fetch() no seu backend.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderNotFound() {
  setActiveNav(null);
  $app.innerHTML = `
    <section class="section">
      <h2 class="h2">Página não encontrada</h2>
      <p class="p">Voltar para <a class="link" href="#/">Home</a>.</p>
    </section>
  `;
}

// ============================
// Templates
// ============================
function storeCard(s) {
  return `
    <a class="card" href="#/loja/${s.slug}">
      <div class="cover" style="background-image:url('${s.coverUrl || ""}')"></div>
      <div class="card__body">
        <div class="storeline">
          <div class="avatar" style="background-image:url('${s.logoUrl || s.coverUrl || ""}')"></div>
          <div style="min-width:0">
            <div class="card__top">
              <h3 class="title">${s.name}</h3>
              ${s.verified ? `<span class="badge">Verificada</span>` : ""}
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

function productCard(p) {
  return `
    <a class="card" href="#/produto/${p.slug}">
      <div class="cover cover--product" style="background-image:url('${p.images?.[0] || ""}')"></div>
      <div class="card__body">
        <h3 class="title">${p.name}</h3>
        <p class="muted">${p.description}</p>
        <p class="price">A partir de <b>${brl(p.priceFrom)}</b></p>
      </div>
    </a>
  `;
}

function cartRow(r) {
  const lineTotal = (r.variant.price * r.qty);
  return `
    <div class="cart-row">
      <div class="cart-row__left">
        <p style="margin:0; font-weight:800">${r.product.name}</p>
        <p class="small">${r.variant.color} / ${r.variant.size} • ${brl(r.variant.price)}</p>
      </div>
      <div class="cart-row__right">
        <input
          class="input"
          style="width:84px"
          id="qty_${r.productId}_${r.variantId}"
          type="number"
          min="0"
          value="${r.qty}"
        />
        <p style="margin:0; width:120px; text-align:right; font-weight:800">
          ${brl(lineTotal)}
        </p>
      </div>
    </div>
  `;
}

// ============================
// Boot
// ============================
window.addEventListener("hashchange", route);
updateCartBadge();
route();