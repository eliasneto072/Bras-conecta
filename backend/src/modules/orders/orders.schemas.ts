import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '../../shared/types/enums';

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const storeIdParamSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    storeId: z.string().min(1),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    notes: z.string().optional(),
    customerName: z.string().min(2),
    customerPhone: z.string().min(10),
    shippingStreet: z.string().optional(),
    shippingNumber: z.string().optional(),
    shippingDistrict: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingState: z.string().length(2).optional(),
    shippingZipCode: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});
