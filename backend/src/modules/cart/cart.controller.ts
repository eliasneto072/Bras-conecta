import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { cartService } from './cart.service';
import {
  addItemSchema,
  updateItemSchema,
  removeItemSchema,
} from './cart.schemas';

function getActor(req: AuthRequest) {
  if (!req.user?.id) {
    throw new AppError('Unauthenticated', 401, 'UNAUTHENTICATED');
  }
  return { id: req.user.id, role: req.user.role };
}

export class CartController {
  get = async (req: AuthRequest, res: Response) => {
    const cart = await cartService.get(getActor(req));
    return ok(res, { cart });
  };

  addItem = async (req: AuthRequest, res: Response) => {
    const parsed = addItemSchema.parse({ body: req.body });
    const cart = await cartService.addItem(getActor(req), parsed.body);
    return ok(res, { cart });
  };

  updateItem = async (req: AuthRequest, res: Response) => {
    const parsed = updateItemSchema.parse({
      params: req.params,
      body: req.body,
    });
    const cart = await cartService.updateItem(
      getActor(req),
      parsed.params.variantId,
      parsed.body
    );
    return ok(res, { cart });
  };

  removeItem = async (req: AuthRequest, res: Response) => {
    const parsed = removeItemSchema.parse({ params: req.params });
    const cart = await cartService.removeItem(getActor(req), parsed.params.variantId);
    return ok(res, { cart });
  };

  clear = async (req: AuthRequest, res: Response) => {
    await cartService.clear(getActor(req));
    return res.status(204).send();
  };
}

export const cartController = new CartController();
