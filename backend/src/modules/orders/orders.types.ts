import { Prisma } from '@prisma/client';
import { OrderStatus, PaymentMethod } from '../../shared/types/enums';

export interface IOrderItemProduct {
  id: string;
  name: string;
  coverImage: string | null;
}

export interface IOrderItemVariant {
  id: string;
  color: string | null;
  size: string | null;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string | null;
  unitPrice: Prisma.Decimal;
  quantity: number;
  totalPrice: Prisma.Decimal;
  createdAt: Date;
  product: IOrderItemProduct;
  variant: IOrderItemVariant;
}

export interface IOrderStore {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
}

export interface IOrder {
  id: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: Prisma.Decimal;
  shippingCost: Prisma.Decimal;
  total: Prisma.Decimal;
  notes: string | null;
  customerName: string;
  customerPhone: string;
  shippingStreet: string | null;
  shippingNumber: string | null;
  shippingDistrict: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  store: IOrderStore;
  items: IOrderItem[];
}
