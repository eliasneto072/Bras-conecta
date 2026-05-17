import { Prisma } from '@prisma/client';
import { ProductStatus } from '../../shared/types/enums';

// ---- Product ----

export type CreateProductData = {
  storeId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  priceFrom: number;
  minQty?: number;
  coverImage?: string;
};

export type UpdateProductData = {
  categoryId?: string | null;
  name?: string;
  slug?: string;
  description?: string;
  status?: ProductStatus;
  priceFrom?: number;
  minQty?: number;
  coverImage?: string;
};

// ---- Variant ----

export type CreateVariantData = {
  productId: string;
  sku?: string;
  color?: string;
  size?: string;
  price: number;
  stock?: number;
};

export type UpdateVariantData = {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
};

// ---- Image ----

export type CreateImageData = {
  productId: string;
  imageUrl: string;
  position?: number;
};
