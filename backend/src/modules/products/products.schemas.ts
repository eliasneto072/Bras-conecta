import { z } from 'zod';
import { ProductStatus } from '../../shared/types/enums';

export const productIdParamSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
  }),
});

export const productVariantParamSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
    variantId: z.string().min(1),
  }),
});

export const productImageParamSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
    imageId: z.string().min(1),
  }),
});

export const createProductSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
  }),
  body: z.object({
    categoryId: z.string().optional(),
    name: z.string().min(2),
    description: z.string().optional(),
    priceFrom: z.number().positive(),
    minQty: z.number().int().positive().optional(),
    coverImage: z.string().url().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
  }),
  body: z
    .object({
      categoryId: z.string().nullable().optional(),
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      status: z.nativeEnum(ProductStatus).optional(),
      priceFrom: z.number().positive().optional(),
      minQty: z.number().int().positive().optional(),
      coverImage: z.string().url().optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: 'At least one field is required',
    }),
});

export const createVariantSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
  }),
  body: z.object({
    sku: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    price: z.number().positive(),
    stock: z.number().int().min(0).optional(),
  }),
});

export const updateVariantSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
    variantId: z.string().min(1),
  }),
  body: z
    .object({
      sku: z.string().optional(),
      color: z.string().optional(),
      size: z.string().optional(),
      price: z.number().positive().optional(),
      stock: z.number().int().min(0).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: 'At least one field is required',
    }),
});

export const createImageSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
  }),
  body: z.object({
    imageUrl: z.string().url(),
    position: z.number().int().min(0).optional(),
  }),
});