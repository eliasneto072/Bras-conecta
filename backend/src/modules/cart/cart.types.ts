import { Prisma } from '@prisma/client';

export interface ICartItemProduct {
  id: string;
  name: string;
  coverImage: string | null;
  store: {
    id: string;
    name: string;
    slug: string;
    whatsapp: string;
    minOrderValue: Prisma.Decimal;
  };
}

export interface ICartItemVariant {
  id: string;
  color: string | null;
  size: string | null;
  price: Prisma.Decimal;
  stock: number;
}

export interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  createdAt: Date;
  product: ICartItemProduct;
  variant: ICartItemVariant;
}

export interface ICart {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: ICartItem[];
}
