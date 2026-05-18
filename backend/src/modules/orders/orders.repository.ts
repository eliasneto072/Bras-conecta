import { prisma } from '../../config/prisma';
import { logger } from '../../shared/utils/logger';
import { IOrderRepository } from './orders.repository.interfaces';
import { IOrder } from './orders.types';
import { CreateOrderData, UpdateOrderStatusData } from './orders.repository.types';

const orderSelect = {
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
    select: {
      id: true,
      name: true,
      slug: true,
      whatsapp: true,
    },
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
      product: {
        select: {
          id: true,
          name: true,
          coverImage: true,
        },
      },
      variant: {
        select: {
          id: true,
          color: true,
          size: true,
        },
      },
    },
  },
} as const;

export class OrdersRepository implements IOrderRepository {
  async findById(id: string): Promise<IOrder | null> {
    try {
      return await prisma.order.findUnique({
        where: { id },
        select: orderSelect,
      });
    } catch (err) {
      logger.error('Erro ao buscar pedido', err);
      throw err;
    }
  }

  async findByUser(userId: string): Promise<IOrder[]> {
    try {
      return await prisma.order.findMany({
        where: { userId },
        select: orderSelect,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      logger.error('Erro ao buscar pedidos do usuário', err);
      throw err;
    }
  }

  async findByStore(storeId: string): Promise<IOrder[]> {
    try {
      return await prisma.order.findMany({
        where: { storeId },
        select: orderSelect,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      logger.error('Erro ao buscar pedidos da loja', err);
      throw err;
    }
  }

  async create(data: CreateOrderData): Promise<IOrder> {
    try {
      return await prisma.order.create({
        data: {
          userId: data.userId,
          storeId: data.storeId,
          paymentMethod: data.paymentMethod,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          total: data.total,
          notes: data.notes,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          shippingStreet: data.shippingStreet,
          shippingNumber: data.shippingNumber,
          shippingDistrict: data.shippingDistrict,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          shippingZipCode: data.shippingZipCode,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantLabel: item.variantLabel,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
            })),
          },
        },
        select: orderSelect,
      });
    } catch (err) {
      logger.error('Erro ao criar pedido', err);
      throw err;
    }
  }

  async updateStatus(id: string, data: UpdateOrderStatusData): Promise<IOrder> {
    try {
      return await prisma.order.update({
        where: { id },
        data: { status: data.status },
        select: orderSelect,
      });
    } catch (err) {
      logger.error('Erro ao atualizar status do pedido', err);
      throw err;
    }
  }
}

export const ordersRepository = new OrdersRepository();
