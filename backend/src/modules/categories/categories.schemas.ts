import { z } from 'zod';

export const categoryIdParamSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
  }),
});

export const createCategorySchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
    id: z.string().min(1),
  }),
  body: z
    .object({
      name: z.string().min(2).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: 'At least one field is required',
    }),
});