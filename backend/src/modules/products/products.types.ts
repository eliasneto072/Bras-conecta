import { Prisma } from '@prisma/client';
import { ProductStatus } from '../../shared/types/enums';

export interface IProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  position: number;
  createdAt: Date;
}

export interface IProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  color: string | null;
  size: string | null;
  price: Prisma.Decimal;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface IProductStore {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  city: string;
  state: string;
  logoUrl: string | null;
}

export interface IProduct {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  priceFrom: Prisma.Decimal;
  minQty: number;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductFull extends IProduct {
  images: IProductImage[];
  variants: IProductVariant[];
  category: IProductCategory | null;
  store: IProductStore;
}
