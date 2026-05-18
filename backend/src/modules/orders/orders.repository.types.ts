import { OrderStatus, PaymentMethod } from '../../shared/types/enums';

export type CreateOrderItemData = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

export type CreateOrderData = {
  userId: string;
  storeId: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes?: string;
  customerName: string;
  customerPhone: string;
  shippingStreet?: string;
  shippingNumber?: string;
  shippingDistrict?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  items: CreateOrderItemData[];
};

export type UpdateOrderStatusData = {
  status: OrderStatus;
};
