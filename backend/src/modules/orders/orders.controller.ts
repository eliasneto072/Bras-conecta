import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { ordersService } from './orders.service';
import {
  orderIdParamSchema,
  storeIdParamSchema,
  createOrderSchema,
  updateOrderStatusSchema,
} from './orders.schemas';

function getActor(req: AuthRequest) {
  if (!req.user?.id) {
    throw new AppError('Unauthenticated', 401, 'UNAUTHENTICATED');
  }
  return { id: req.user.id, role: req.user.role };
}

export class OrdersController {
  getById = async (req: AuthRequest, res: Response) => {
    const parsed = orderIdParamSchema.parse({ params: req.params });
    const order = await ordersService.getById(getActor(req), parsed.params.id);
    return ok(res, { order });
  };

  listMyOrders = async (req: AuthRequest, res: Response) => {
    const orders = await ordersService.listMyOrders(getActor(req));
    return ok(res, { orders });
  };

  listStoreOrders = async (req: AuthRequest, res: Response) => {
    const parsed = storeIdParamSchema.parse({ params: req.params });
    const orders = await ordersService.listStoreOrders(getActor(req), parsed.params.storeId);
    return ok(res, { orders });
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = createOrderSchema.parse({ body: req.body });
    const order = await ordersService.create(getActor(req), parsed.body);
    return ok(res, { order }, 201);
  };

  updateStatus = async (req: AuthRequest, res: Response) => {
    const parsed = updateOrderStatusSchema.parse({
      params: req.params,
      body: req.body,
    });
    const order = await ordersService.updateStatus(
      getActor(req),
      parsed.params.id,
      parsed.body
    );
    return ok(res, { order });
  };
}

export const ordersController = new OrdersController();
