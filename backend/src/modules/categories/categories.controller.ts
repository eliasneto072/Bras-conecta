import type { Request, Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { categoriesService } from './categories.service';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.schemas';

function getActor(req: AuthRequest) {
  if (!req.user?.id) {
    throw new AppError('Unauthenticated', 401, 'UNAUTHENTICATED');
  }
  return { id: req.user.id, role: req.user.role };
}

export class CategoriesController {
  list = async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    const categories = await categoriesService.list(storeId);
    return ok(res, { categories });
  };

  getById = async (req: Request, res: Response) => {
    const parsed = categoryIdParamSchema.parse({ params: req.params });
    const category = await categoriesService.getById(parsed.params.id);
    return ok(res, { category });
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = createCategorySchema.parse({
      params: req.params,
      body: req.body,
    });
    const category = await categoriesService.create(
      getActor(req),
      parsed.params.storeId,
      parsed.body
    );
    return ok(res, { category }, 201);
  };

  update = async (req: AuthRequest, res: Response) => {
    const parsed = updateCategorySchema.parse({
      params: req.params,
      body: req.body,
    });
    const category = await categoriesService.update(
      getActor(req),
      parsed.params.id,
      parsed.body
    );
    return ok(res, { category });
  };

  remove = async (req: AuthRequest, res: Response) => {
    const parsed = categoryIdParamSchema.parse({ params: req.params });
    await categoriesService.remove(getActor(req), parsed.params.id);
    return res.status(204).send();
  };
}

export const categoriesController = new CategoriesController();