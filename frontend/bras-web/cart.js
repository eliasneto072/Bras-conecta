// ============================
// cart.js — Carrinho
// ============================

import { cartApi } from './api.js';
import { isLoggedIn } from './auth.js';

const CART_KEY = 'bras_cart_v1';

// ============================
// Carrinho local (fallback sem login)
// ============================

function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocalCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

// ============================
// Badge
// ============================

//export function updateCartBadge() {
//  const badge = document.getElementById('cartBadge');
//  if (!badge) return;
//  const items = getLocalCart();
//  const total = items.reduce((acc, i) => acc + i.qty, 0);
//  badge.textContent = String(total);
//}
export async function updateCartBadge() {

  const badge = document.getElementById('cartBadge');

  if (!badge) return;

  // usuário logado → usa API
  if (isLoggedIn()) {

    try {

      const data = await cartApi.get();

      const items = data.data?.cart?.items || [];

      const total = items.reduce(
        (acc, i) => acc + i.quantity,
        0
      );

      badge.textContent = String(total);

      return;

    } catch {

      badge.textContent = '0';
      return;

    }

  }

  // fallback local
  const items = getLocalCart();

  const total = items.reduce(
    (acc, i) => acc + i.qty,
    0
  );

  badge.textContent = String(total);
}

// ============================
// API cart — usuário logado
// ============================

export async function fetchCart() {
  if (!isLoggedIn()) return { items: getLocalCart() };
  try {
    const data = await cartApi.get();
    // sincroniza badge com o carrinho do servidor
    const badge = document.getElementById('cartBadge');
    if (badge) {
      const total = (data.data?.cart?.items || []).reduce(
        (acc, i) => acc + i.quantity,
        0
        );
      badge.textContent = String(total);
    }
    return data.data?.cart || { items: [] };
  } catch {
    return { items: [] };
  }
}

export async function addToCart(productId, variantId, qty) {
  if (isLoggedIn()) {
    const data = await cartApi.addItem(productId, variantId, qty);
    updateCartBadge();
    return data.data?.cart;
  }
  // fallback local
  const items = getLocalCart();
  const idx = items.findIndex(i => i.productId === productId && i.variantId === variantId);
  if (idx >= 0) items[idx].qty += qty;
  else items.push({ productId, variantId, qty });
  setLocalCart(items);
  return { items };
}

export async function updateCartItem(variantId, qty, productId = null) {
  if (isLoggedIn()) {
    const data = await cartApi.updateItem(variantId, qty);
    updateCartBadge();
    return data.data?.cart;
  }
  const items = getLocalCart()
    .map(i => i.variantId === variantId ? { ...i, qty } : i)
    .filter(i => i.qty > 0);
  setLocalCart(items);
  return { items };
}

export async function removeCartItem(variantId) {
  if (isLoggedIn()) {
    const data = await cartApi.removeItem(variantId);
    updateCartBadge();
    return data.data?.cart;
  }
  const items = getLocalCart().filter(i => i.variantId !== variantId);
  setLocalCart(items);
  return { items };
}

export async function clearCart() {
  if (isLoggedIn()) {
    await cartApi.clear();
  }
  setLocalCart([]);
  updateCartBadge();
}

// ============================
// Migra carrinho local → API ao logar
// ============================

export async function migrateLocalCartToApi() {
  if (!isLoggedIn()) return;
  const localItems = getLocalCart();
  if (localItems.length === 0) return;

  for (const item of localItems) {
    try {
      await cartApi.addItem(item.productId, item.variantId, item.qty);
    } catch {
      // ignora itens com erro (ex: sem estoque)
    }
  }
  setLocalCart([]); // limpa local após migrar
}