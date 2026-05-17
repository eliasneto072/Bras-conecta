import { ProductStatus } from '../../shared/types/enums';

// ---- Product ----

export type CreateProductInput = {
  storeId: string;
  categoryId?: string;
  name: string;
  description?: string;
  priceFrom: number;
  minQty?: number;
  coverImage?: string;
};

export type UpdateProductInput = {
  categoryId?: string | null;
  name?: string;
  description?: string;
  status?: ProductStatus;
  priceFrom?: number;
  minQty?: number;
  coverImage?: string;
};

// ---- Variant ----

export type CreateVariantInput = {
  sku?: string;
  color?: string;
  size?: string;
  price: number;
  stock?: number;
};

export type UpdateVariantInput = {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
};

// ---- Image ----

export type CreateImageInput = {
  imageUrl: string;
  position?: number;
};
