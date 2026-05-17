import { z } from 'zod';
import { StoreStatus } from '../../shared/types/enums';

export const storeIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const storeSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    whatsapp: z.string().min(10),
    email: z.string().email().optional(),
    city: z.string().min(2),
    state: z.string().length(2), // ex: "SP"
    logoUrl: z.string().url().optional(),
    bannerUrl: z.string().url().optional(),
    minOrderValue: z.number().positive(),
  }),
});

export const updateStoreSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      whatsapp: z.string().min(10).optional(),
      email: z.string().email().optional(),
      city: z.string().min(2).optional(),
      state: z.string().length(2).optional(),
      logoUrl: z.string().url().optional(),
      bannerUrl: z.string().url().optional(),
      minOrderValue: z.number().positive().optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: 'At least one field is required',
    }),
});

export const updateStoreStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(StoreStatus),
    verified: z.boolean().optional(),
  }),
});
