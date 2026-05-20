import { AppError } from '../../shared/errors/AppError';
import { ordersRepository } from './orders.repository';
import { cartRepository } from '../cart/cart.repository';
import { storesRepository } from '../stores/stores.repository';
import { prisma } from '../../config/prisma';
import { IOrder } from './orders.types';
import { CreateOrderInput, UpdateOrderStatusInput } from './orders.service.types';
import { Actor } from '../users/users.types';
import { UserRole, PaymentMethod, OrderStatus } from '../../shared/types/enums';

function isAdmin(role?: UserRole) {
  return role === UserRole.ADMIN;
}

export class OrdersService {
  private async ensureOrderExists(id: string): Promise<IOrder> {
    const order = await ordersRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    return order;
  }

  async getById(actor: Actor, id: string): Promise<IOrder> {
    const order = await this.ensureOrderExists(id);

    // cliente só vê seu próprio pedido
    // dono da loja só vê pedidos da sua loja
    // admin vê tudo
    if (isAdmin(actor.role)) return order;

    const isOwner = order.userId === actor.id;

    const store = await storesRepository.findById(order.storeId);
    const isStoreOwner = store?.ownerId === actor.id;

    if (!isOwner && !isStoreOwner) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return order;
  }

  async listMyOrders(actor: Actor): Promise<IOrder[]> {
    return ordersRepository.findByUser(actor.id);
  }

  async listStoreOrders(actor: Actor, storeId: string): Promise<IOrder[]> {
    const store = await storesRepository.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }

    if (!isAdmin(actor.role) && store.ownerId !== actor.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    return ordersRepository.findByStore(storeId);
  }

  async create(actor: Actor, input: CreateOrderInput): Promise<IOrder> {
    // busca o carrinho do usuário
    const cart = await cartRepository.findByUser(actor.id);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400, 'CART_EMPTY');
    }

    // filtra apenas os itens da loja solicitada
    const storeItems = cart.items.filter((item) => item.product.store.id === input.storeId);
    if (storeItems.length === 0) {
      throw new AppError('No items from this store in cart', 400, 'NO_STORE_ITEMS');
    }

    // busca a loja para validar pedido mínimo
    const store = await storesRepository.findById(input.storeId);
    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }

    // calcula subtotal
    const subtotal = storeItems.reduce((acc, item) => {
      return acc + Number(item.variant.price) * item.quantity;
    }, 0);

    // valida pedido mínimo
    if (subtotal < Number(store.minOrderValue)) {
      throw new AppError(
        `Minimum order value is R$ ${Number(store.minOrderValue).toFixed(2)}`,
        400,
        'BELOW_MIN_ORDER'
      );
    }

    const shippingCost = 0; // será calculado futuramente com integração de frete
    const total = subtotal + shippingCost;

    // monta os itens do pedido
    const orderItems = storeItems.map((item) => {
      const variantParts = [item.variant.color, item.variant.size].filter(Boolean);
      const variantLabel = variantParts.length > 0 ? variantParts.join(' / ') : null;

      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantLabel,
        unitPrice: Number(item.variant.price),
        quantity: item.quantity,
        totalPrice: Number(item.variant.price) * item.quantity,
      };
    });

    // cria o pedido e decrementa estoque em uma transação
    const order = await prisma.$transaction(async (tx) => {
      // decrementa estoque de cada variante
      for (const item of storeItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        });

        if (!variant || variant.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for variant ${item.variantId}`,
            400,
            'INSUFFICIENT_STOCK'
          );
        }

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // cria o pedido
      return tx.order.create({
        data: {
          userId: actor.id,
          storeId: input.storeId,
          paymentMethod: input.paymentMethod ?? PaymentMethod.WHATSAPP,
          subtotal,
          shippingCost,
          total,
          notes: input.notes,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          shippingStreet: input.shippingStreet,
          shippingNumber: input.shippingNumber,
          shippingDistrict: input.shippingDistrict,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingZipCode: input.shippingZipCode,
          items: {
            create: orderItems,
          },
        },
        select: {
          id: true,
          userId: true,
          storeId: true,
          status: true,
          paymentMethod: true,
          subtotal: true,
          shippingCost: true,
          total: true,
          notes: true,
          customerName: true,
          customerPhone: true,
          shippingStreet: true,
          shippingNumber: true,
          shippingDistrict: true,
          shippingCity: true,
          shippingState: true,
          shippingZipCode: true,
          createdAt: true,
          updatedAt: true,
          store: {
            select: { id: true, name: true, slug: true, whatsapp: true },
          },
          items: {
            select: {
              id: true,
              orderId: true,
              productId: true,
              variantId: true,
              productName: true,
              variantLabel: true,
              unitPrice: true,
              quantity: true,
              totalPrice: true,
              createdAt: true,
              product: { select: { id: true, name: true, coverImage: true } },
              variant: { select: { id: true, color: true, size: true } },
            },
          },
        },
      });
    });

    // limpa apenas os itens da loja do carrinho
    const cartItemsToRemove = storeItems.map((i) => i.variantId);
    for (const variantId of cartItemsToRemove) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, variantId },
      });
    }

    return order as IOrder;
  }

//  async updateStatus(actor: Actor, id: string, input: //UpdateOrderStatusInput): Promise<IOrder> {
//    const order = await this.ensureOrderExists(id);
//
//    const store = await storesRepository.findById(order.//storeId);
//    const isStoreOwner = store?.ownerId === actor.id;
//
//    if (!isAdmin(actor.role) && !isStoreOwner) {
//      throw new AppError('Forbidden', 403, 'FORBIDDEN');
//    }
//
//    // cliente não pode cancelar pedido já confirmado/pago///enviado
//    const lockedStatuses: OrderStatus[] = [
//      OrderStatus.PAID,
//      OrderStatus.SHIPPED,
//      OrderStatus.DELIVERED,
//    ];
//
//    if (lockedStatuses.includes(order.status as //OrderStatus) && !isAdmin(actor.role)) {
//      throw new AppError('Cannot update status of this //order', 400, 'ORDER_STATUS_LOCKED');
//    }
//
//    return ordersRepository.updateStatus(id, { status: input.//status });
//  }

  async updateStatus(actor: Actor, id: string, input: UpdateOrderStatusInput): Promise<IOrder> {
    const order = await this.ensureOrderExists(id);

    const store        = await storesRepository.findById(order.storeId);
    const isStoreOwner = store?.ownerId === actor.id;
    const isCustomer   = order.userId === actor.id;

    if (!isAdmin(actor.role) && !isStoreOwner && !isCustomer) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    const current = order.status as OrderStatus;
    const next    = input.status as OrderStatus;

    // ── Regras de transição por papel ────────────────────────────────────
    //
    //  Lojista:  PENDING → CONFIRMED → PAID → SHIPPED
    //            PENDING | CONFIRMED → CANCELED
    //
    //  Cliente:  SHIPPED → DELIVERED  (confirma o recebimento)
    //            PENDING | CONFIRMED  → CANCELED
    //
    //  Admin:    qualquer transição

    if (!isAdmin(actor.role)) {

      const sellerTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
        [OrderStatus.PENDING]:   [OrderStatus.CONFIRMED, OrderStatus.CANCELED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PAID,      OrderStatus.CANCELED],
        [OrderStatus.PAID]:      [OrderStatus.SHIPPED],
        [OrderStatus.SHIPPED]:   [], // lojista não confirma entrega
      };

      const customerTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
        [OrderStatus.PENDING]:   [OrderStatus.CANCELED],
        [OrderStatus.CONFIRMED]: [OrderStatus.CANCELED],
        [OrderStatus.SHIPPED]:   [OrderStatus.DELIVERED], // só o cliente confirma entrega
      };

      if (isStoreOwner) {
        const allowed = sellerTransitions[current] ?? [];
        if (!allowed.includes(next)) {
          throw new AppError(
            `Lojista não pode alterar de ${current} para ${next}`,
            400,
            'ORDER_TRANSITION_NOT_ALLOWED',
          );
        }
      } else if (isCustomer) {
        const allowed = customerTransitions[current] ?? [];
        if (!allowed.includes(next)) {
          throw new AppError(
            `Cliente não pode alterar de ${current} para ${next}`,
            400,
            'ORDER_TRANSITION_NOT_ALLOWED',
          );
        }
      }
    }

    return ordersRepository.updateStatus(id, { status: next });
  }


}

export const ordersService = new OrdersService();
