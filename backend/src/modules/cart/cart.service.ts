import { AppError } from '../../shared/errors/AppError';
import { cartRepository } from './cart.repository';
import { prisma } from '../../config/prisma';
import { ICart } from './cart.types';
import { AddItemInput, UpdateItemInput } from './cart.service.types';
import { Actor } from '../users/users.types';

export class CartService {
  async get(actor: Actor): Promise<ICart | null> {
    return cartRepository.findByUser(actor.id);
  }

  async addItem(actor: Actor, input: AddItemInput): Promise<ICart> {
    // valida se a variante existe e tem estoque suficiente
    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
      select: { id: true, productId: true, stock: true },
    });

    if (!variant) {
      throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    }

    if (variant.productId !== input.productId) {
      throw new AppError('Variant does not belong to product', 400, 'VARIANT_PRODUCT_MISMATCH');
    }

    if (variant.stock < input.quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${variant.stock}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    if (input.quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400, 'INVALID_QUANTITY');
    }

    return cartRepository.addItem({
      userId: actor.id,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    });
  }

  async updateItem(actor: Actor, variantId: string, input: UpdateItemInput): Promise<ICart> {
    if (input.quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400, 'INVALID_QUANTITY');
    }

    const cart = await cartRepository.findByUser(actor.id);
    if (!cart) {
      throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    }

    const item = cart.items.find((i) => i.variantId === variantId);
    if (!item) {
      throw new AppError('Item not found in cart', 404, 'CART_ITEM_NOT_FOUND');
    }

    // valida estoque
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });

    if (!variant || variant.stock < input.quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${variant?.stock ?? 0}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    return cartRepository.updateItem(cart.id, variantId, input);
  }

  async removeItem(actor: Actor, variantId: string): Promise<ICart> {
    const cart = await cartRepository.findByUser(actor.id);
    if (!cart) {
      throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
    }

    const item = cart.items.find((i) => i.variantId === variantId);
    if (!item) {
      throw new AppError('Item not found in cart', 404, 'CART_ITEM_NOT_FOUND');
    }

    return cartRepository.removeItem(cart.id, variantId);
  }

  async clear(actor: Actor): Promise<void> {
    const cart = await cartRepository.findByUser(actor.id);
    if (!cart) return;
    return cartRepository.clear(cart.id);
  }
}

export const cartService = new CartService();
