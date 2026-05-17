import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { storesService } from './stores.service';
import {
  createStoreSchema,
  updateStoreSchema,
  updateStoreStatusSchema,
  storeIdParamSchema,
  storeSlugParamSchema,
} from './stores.schemas';

function getActor(req: AuthRequest) {
  if (!req.user?.id) {
    throw new AppError('Unauthenticated', 401, 'UNAUTHENTICATED');
  }
  return {
    id: req.user.id,
    role: req.user.role,
  };
}

export class StoresController {
  list = async (req: AuthRequest, res: Response) => {
    const stores = await storesService.list();
    return ok(res, { stores });
  };

  getById = async (req: AuthRequest, res: Response) => {
    const parsed = storeIdParamSchema.parse({ params: req.params });
    const store = await storesService.getById(parsed.params.id);
    return ok(res, { store });
  };

  getBySlug = async (req: AuthRequest, res: Response) => {
    const parsed = storeSlugParamSchema.parse({ params: req.params });
    const store = await storesService.getBySlug(parsed.params.slug);
    return ok(res, { store });
  };

  getMyStores = async (req: AuthRequest, res: Response) => {
    const stores = await storesService.getMyStores(getActor(req));
    return ok(res, { stores });
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = createStoreSchema.parse({ body: req.body });
    const store = await storesService.create(getActor(req), parsed.body);
    return ok(res, { store }, 201);
  };

  update = async (req: AuthRequest, res: Response) => {
    const parsed = updateStoreSchema.parse({
      params: req.params,
      body: req.body,
    });
    const store = await storesService.update(
      getActor(req),
      parsed.params.id,
      parsed.body
    );
    return ok(res, { store });
  };

  updateStatus = async (req: AuthRequest, res: Response) => {
    const parsed = updateStoreStatusSchema.parse({
      params: req.params,
      body: req.body,
    });
    const store = await storesService.updateStatus(
      getActor(req),
      parsed.params.id,
      parsed.body
    );
    return ok(res, { store });
  };

  remove = async (req: AuthRequest, res: Response) => {
    const parsed = storeIdParamSchema.parse({ params: req.params });
    await storesService.remove(getActor(req), parsed.params.id);
    return res.status(204).send();
  };
}

export const storesController = new StoresController();
