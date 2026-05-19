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
  localStorage.setItem(TOKEN_KEY, data.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
  return data.data.user;
}

export async function register(name, email, password) {
  const data = await authApi.register(name, email, password);
  return data.data.user;
}

export async function logout() {
  // Avisa o servidor para invalidar o token na blacklist.
  // O try/catch garante que mesmo se a API falhar (sem internet,
  // servidor fora), o usuário ainda sai do frontend normalmente.
  try {
    await authApi.logout();
  } catch {
    // silencioso — logout local acontece de qualquer forma
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.hash = '#/login';
}

// ============================
// Guards
// ============================

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
    return false;
  }
  return true;
}

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