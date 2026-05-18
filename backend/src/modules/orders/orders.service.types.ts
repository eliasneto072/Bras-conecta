import { OrderStatus, PaymentMethod } from '../../shared/types/enums';

export type CreateOrderInput = {
  storeId: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  customerName: string;
  customerPhone: string;
  shippingStreet?: string;
  shippingNumber?: string;
  shippingDistrict?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
};

export type UpdateOrderStatusInput = {
  status: OrderStatus;
};
