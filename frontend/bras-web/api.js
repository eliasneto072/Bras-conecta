// ============================
// api.js — Camada de API
// ============================

const BASE_URL = 'http://localhost:3000'; // troca pela URL de produção no deploy

// ============================
// Core fetch
// ============================

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('bras_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  // token expirado — desloga automaticamente
  if (res.status === 401) {
    localStorage.removeItem('bras_token');
    localStorage.removeItem('bras_user');
    window.location.hash = '#/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Erro na requisição');
  }

  return data;
}

const get  = (path, auth = false)        => request('GET',    path, null, auth);
const post = (path, body, auth = false)  => request('POST',   path, body, auth);
const patch= (path, body, auth = false)  => request('PATCH',  path, body, auth);
const del  = (path, auth = false)        => request('DELETE', path, null, auth);

// ============================
// Auth
// ============================

export const authApi = {
  login:    (email, password)       => post('/auth/login', { email, password }),
  register: (name, email, password) => post('/users', { name, email, password }),
  me:       ()                      => get('/auth/me', true),
};

// ============================
// Stores
// ============================

export const storesApi = {
  list:         ()      => get('/stores'),
  getBySlug:    (slug)  => get(`/stores/slug/${slug}`),
  getById:      (id)    => get(`/stores/${id}`),
  getMyStores:  ()      => get('/stores/me/stores', true),

  create: (data)        => post('/stores', data, true),
  update: (id, data)    => patch(`/stores/${id}`, data, true),
  updateStatus: (id, data) => patch(`/stores/${id}/status`, data, true),
  remove: (id)          => del(`/stores/${id}`, true),
};

// ============================
// Products
// ============================

export const productsApi = {
  list:      (storeId)       => get(`/stores/${storeId}/products`),
  getById:   (storeId, id)   => get(`/stores/${storeId}/products/${id}`),
  getBySlug: (storeId, slug) => get(`/stores/${storeId}/products/slug/${slug}`),

  create: (storeId, data)    => post(`/stores/${storeId}/products`, data, true),
  update: (storeId, id, data)=> patch(`/stores/${storeId}/products/${id}`, data, true),
  remove: (storeId, id)      => del(`/stores/${storeId}/products/${id}`, true),

  // variantes
  addVariant:    (storeId, productId, data)              => post(`/stores/${storeId}/products/${productId}/variants`, data, true),
  updateVariant: (storeId, productId, variantId, data)   => patch(`/stores/${storeId}/products/${productId}/variants/${variantId}`, data, true),
  removeVariant: (storeId, productId, variantId)         => del(`/stores/${storeId}/products/${productId}/variants/${variantId}`, true),

  // imagens
  addImage:    (storeId, productId, data)    => post(`/stores/${storeId}/products/${productId}/images`, data, true),
  removeImage: (storeId, productId, imageId) => del(`/stores/${storeId}/products/${productId}/images/${imageId}`, true),
};

// ============================
// Categories
// ============================

export const categoriesApi = {
  list:   (storeId)        => get(`/stores/${storeId}/categories`),
  create: (storeId, data)  => post(`/stores/${storeId}/categories`, data, true),
  update: (storeId, id, data) => patch(`/stores/${storeId}/categories/${id}`, data, true),
  remove: (storeId, id)    => del(`/stores/${storeId}/categories/${id}`, true),
};

// ============================
// Cart
// ============================

export const cartApi = {
  get:        ()                           => get('/cart', true),
  addItem:    (productId, variantId, qty)  => post('/cart/items', { productId, variantId, quantity: qty }, true),
  updateItem: (variantId, qty)             => patch(`/cart/items/${variantId}`, { quantity: qty }, true),
  removeItem: (variantId)                  => del(`/cart/items/${variantId}`, true),
  clear:      ()                           => del('/cart', true),
};

// ============================
// Orders
// ============================

export const ordersApi = {
  myOrders:     ()         => get('/orders/me', true),
  storeOrders:  (storeId)  => get(`/orders/store/${storeId}`, true),
  getById:      (id)       => get(`/orders/${id}`, true),
  create:       (data)     => post('/orders', data, true),
  updateStatus: (id, status) => patch(`/orders/${id}/status`, { status }, true),
};

// ============================
// Subscriptions
// ============================

export const subscriptionsApi = {
  plans:           ()               => get('/subscriptions/plans'),
  getSubscription: (storeId)        => get(`/subscriptions/stores/${storeId}`, true),
  checkout:        (storeId, planName) => post(`/subscriptions/stores/${storeId}/checkout`, { planName }, true),
  cancel:          (storeId)        => del(`/subscriptions/stores/${storeId}`, true),
};

// ============================
// Upload
// ============================

export const uploadApi = {

  async image(file) {

    const formData = new FormData();

    formData.append('image', file);

    const token =
      localStorage.getItem('bras_token');

    const res = await fetch(
      `${BASE_URL}/upload`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`
        },

        body: formData
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message || 'Erro upload'
      );
    }

    return data;

  }

};  