import { prisma } from '../../config/prisma';
import { logger } from '../../shared/utils/logger';
import { ICartRepository } from './cart.repository.interfaces';
import { ICart } from './cart.types';
import { AddCartItemData, UpdateCartItemData } from './cart.repository.types';

const cartSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      cartId: true,
      productId: true,
      variantId: true,
      quantity: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
          coverImage: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              whatsapp: true,
              minOrderValue: true,
            },
          },
        },
      },
      variant: {
        select: {
          id: true,
          color: true,
          size: true,
          price: true,
          stock: true,
        },
      },
    },
  },
} as const;

export class CartRepository implements ICartRepository {
  // garante que o carrinho existe, criando se necessário
  private async ensureCart(userId: string) {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      select: { id: true },
    });
  }

  async findByUser(userId: string): Promise<ICart | null> {
    try {
      return await prisma.cart.findUnique({
        where: { userId },
        select: cartSelect,
      });
    } catch (err) {
      logger.error('Erro ao buscar carrinho', err);
      throw err;
    }
  }

  async addItem(data: AddCartItemData): Promise<ICart> {
    try {
      const cart = await this.ensureCart(data.userId);

      // se variante já está no carrinho, incrementa quantidade
      await prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId: data.variantId } },
        create: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
        },
        update: {
          quantity: { increment: data.quantity },
        },
      });

      return await prisma.cart.findUniqueOrThrow({
        where: { id: cart.id },
        select: cartSelect,
      });
    } catch (err) {
      logger.error('Erro ao adicionar item ao carrinho', err);
      throw err;
    }
  }

  async updateItem(cartId: string, variantId: string, data: UpdateCartItemData): Promise<ICart> {
    try {
      await prisma.cartItem.update({
        where: { cartId_variantId: { cartId, variantId } },
        data: { quantity: data.quantity },
      });

      return await prisma.cart.findUniqueOrThrow({
        where: { id: cartId },
        select: cartSelect,
      });
    } catch (err) {
      logger.error('Erro ao atualizar item do carrinho', err);
      throw err;
    }
  }

  async removeItem(cartId: string, variantId: string): Promise<ICart> {
    try {
      await prisma.cartItem.delete({
        where: { cartId_variantId: { cartId, variantId } },
      });

      return await prisma.cart.findUniqueOrThrow({
        where: { id: cartId },
        select: cartSelect,
      });
    } catch (err) {
      logger.error('Erro ao remover item do carrinho', err);
      throw err;
    }
  }

  async clear(cartId: string): Promise<void> {
    try {
      await prisma.cartItem.deleteMany({ where: { cartId } });
    } catch (err) {
      logger.error('Erro ao limpar carrinho', err);
      throw err;
    }
  }
}

export const cartRepository = new CartRepository();
