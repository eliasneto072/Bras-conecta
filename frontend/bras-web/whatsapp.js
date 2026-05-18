// ============================
// whatsapp.js — Mensagem rica
// ============================

const APP_NAME = 'Brás Conecta';
const APP_URL  = 'https://brasconecta.com.br'; // troca pela URL real

export function brl(n) {
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================
// Gera mensagem do carrinho
// ============================

export function buildCartMessage({ storeName, items, total, customerName = null }) {
  const greeting = customerName
    ? `Olá, ${storeName}! Meu nome é *${customerName}*.`
    : `Olá, *${storeName}*!`;

  const itemLines = items.map(item => {
    const label = [item.color, item.size].filter(Boolean).join(' / ');
    const price  = brl(item.price);
    const subtotal = brl(Number(item.price) * item.quantity);
    return `▪ *${item.productName}*${label ? ` (${label})` : ''}\n  Qtd: ${item.quantity} × ${price} = *${subtotal}*`;
  });

  const lines = [
    greeting,
    ``,
    `Tenho interesse nos seguintes produtos:`,
    ``,
    ...itemLines,
    ``,
    `─────────────────`,
    `💰 *Total estimado: ${brl(total)}*`,
    ``,
    `📱 _Pedido feito pelo ${APP_NAME}_`,
    `🔗 ${APP_URL}`,
    ``,
    `Aguardo confirmação de disponibilidade e dados para pagamento. Obrigado!`,
  ];

  return lines.join('\n');
}

// ============================
// Abre o WhatsApp
// ============================

export function openWhatsApp(phone, message) {
  // garante formato internacional sem + ou espaços
  const cleanPhone = String(phone).replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noreferrer');
}

// ============================
// Atalho: abre direto do carrinho
// ============================

export function openWhatsAppFromCart({ store, items, customerName = null }) {
  if (!store?.whatsapp) {
    alert('WhatsApp da loja não encontrado.');
    return;
  }

  const total = items.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0);

  const message = buildCartMessage({
    storeName: store.name,
    items,
    total,
    customerName,
  });

  openWhatsApp(store.whatsapp, message);
}