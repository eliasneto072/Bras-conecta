import { IOrder } from './orders.types';
import { CreateOrderData, UpdateOrderStatusData } from './orders.repository.types';

export interface IOrderRepository {
  findById(id: string): Promise<IOrder | null>;
  findByUser(userId: string): Promise<IOrder[]>;
  findByStore(storeId: string): Promise<IOrder[]>;
  create(data: CreateOrderData): Promise<IOrder>;
  updateStatus(id: string, data: UpdateOrderStatusData): Promise<IOrder>;
}
