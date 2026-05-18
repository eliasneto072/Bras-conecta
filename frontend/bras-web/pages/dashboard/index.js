import { getUser } from '../../auth.js';

export async function renderDashboard() {

  const user = getUser();

  const $app = document.getElementById('app');

  $app.innerHTML = `
    <section class="section">

      <div class="box">

        <h2 class="h2">
          Painel
        </h2>

        <p class="p">
          Bem-vindo,
          <strong>${user?.name || 'Usuário'}</strong>
        </p>

        <div class="hr"></div>

        <div class="grid cols-3">

          <div class="card">
            <div class="card__body">
              <h3>Pedidos</h3>
              <p class="muted">
                Gerencie pedidos do WhatsApp
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card__body">
              <h3>Produtos</h3>
              <p class="muted">
                Gerencie catálogo
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card__body">
              <h3>Loja</h3>
              <p class="muted">
                Configurações da loja
              </p>
            </div>
          </div>

        </div>

      </div>

    </section>
  `;
}