import { ICart } from './cart.types';
import { AddCartItemData, UpdateCartItemData } from './cart.repository.types';

export interface ICartRepository {
  findByUser(userId: string): Promise<ICart | null>;
  addItem(data: AddCartItemData): Promise<ICart>;
  updateItem(cartId: string, variantId: string, data: UpdateCartItemData): Promise<ICart>;
  removeItem(cartId: string, variantId: string): Promise<ICart>;
  clear(cartId: string): Promise<void>;
}
