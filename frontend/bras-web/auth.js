// ============================
// auth.js — Autenticação
// ============================

import { authApi } from './api.js';

const TOKEN_KEY = 'bras_token';
const USER_KEY  = 'bras_user';

// ============================
// Getters
// ============================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function isAdmin() {
  return getUser()?.role === 'ADMIN';
}

export function isSeller() {
  const role = getUser()?.role;
  return role === 'SELLER' || role === 'ADMIN';
}

// ============================
// Actions
// ============================

export async function login(email, password) {
  const data = await authApi.login(email, password);

  // seu backend retorna { token, user } — ajuste se precisar
  localStorage.setItem(TOKEN_KEY, data.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));

  return data.data.user;
}

export async function register(name, email, password) {
  const data = await authApi.register(name, email, password);
  return data.data.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.hash = '#/login';
}

// ============================
// Guards
// ============================

// redireciona para login se não estiver logado
export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
    return false;
  }
  return true;
}

// redireciona para home se não for lojista/admin
export function requireSeller() {
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
    return false;
  }
  if (!isSeller()) {
    window.location.hash = '#/';
    return false;
  }
  return true;
}