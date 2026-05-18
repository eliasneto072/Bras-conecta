// ============================
// pages/login.js
// ============================

import { login, register, isLoggedIn } from '../auth.js';
import { migrateLocalCartToApi } from '../cart.js';

export async function renderLogin() {
  if (isLoggedIn()) {
    window.location.hash = '#/dashboard';
    return;
  }

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="section" style="max-width:420px; margin: 40px auto">
      <div class="box">
        <h2 class="h2" style="margin-bottom:4px">Entrar</h2>
        <p class="muted" style="margin-top:0; margin-bottom:16px">Acesse o painel do lojista</p>

        <div id="loginError" class="error-msg" style="display:none"></div>

        <div class="label">E-mail</div>
        <input class="input" id="loginEmail" type="email" placeholder="seu@email.com" />

        <div class="hr"></div>

        <div class="label">Senha</div>
        <input class="input" id="loginPassword" type="password" placeholder="••••••" />

        <div class="hr"></div>

        <button class="btn2" id="loginBtn">Entrar</button>

        <div style="height:10px"></div>

        <button class="btn3" id="showRegisterBtn">Criar conta</button>
      </div>

      <div class="box" id="registerBox" style="margin-top:14px; display:none">
        <h2 class="h2" style="margin-bottom:4px">Criar conta</h2>

        <div id="registerError" class="error-msg" style="display:none"></div>

        <div class="label">Nome</div>
        <input class="input" id="regName" type="text" placeholder="Seu nome" />

        <div class="hr"></div>

        <div class="label">E-mail</div>
        <input class="input" id="regEmail" type="email" placeholder="seu@email.com" />

        <div class="hr"></div>

        <div class="label">Senha</div>
        <input class="input" id="regPassword" type="password" placeholder="mínimo 6 caracteres" />

        <div class="hr"></div>

        <button class="btn2" id="registerBtn">Criar conta</button>
      </div>
    </section>
  `;

  // toggle registro
  document.getElementById('showRegisterBtn').addEventListener('click', () => {
    const box = document.getElementById('registerBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  });

  // login
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl  = document.getElementById('loginError');

    if (!email || !password) {
      showError(errorEl, 'Preencha e-mail e senha.');
      return;
    }

    setLoading('loginBtn', true);
    try {
      await login(email, password);
      await migrateLocalCartToApi(); // migra carrinho local para API
      window.location.hash = '#/dashboard';
    } catch (err) {
      showError(errorEl, err.message || 'Erro ao fazer login.');
    } finally {
      setLoading('loginBtn', false);
    }
  });

  // registro
  document.getElementById('registerBtn').addEventListener('click', async () => {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errorEl  = document.getElementById('registerError');

    if (!name || !email || !password) {
      showError(errorEl, 'Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      showError(errorEl, 'Senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading('registerBtn', true);
    try {
      await register(name, email, password);
      // após registro, faz login automático
      await login(email, password);
      await migrateLocalCartToApi();
      window.location.hash = '#/dashboard';
    } catch (err) {
      showError(errorEl, err.message || 'Erro ao criar conta.');
    } finally {
      setLoading('registerBtn', false);
    }
  });
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Aguarde...' : btn.id === 'loginBtn' ? 'Entrar' : 'Criar conta';
}