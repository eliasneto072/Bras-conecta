import type { Response, Request } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware';
import { ok } from '../../shared/http/response';
import { AppError } from '../../shared/errors/AppError';
import { productsService } from './products.service';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productVariantParamSchema,
  productImageParamSchema,
  createVariantSchema,
  updateVariantSchema,
  createImageSchema,
} from './products.schemas';

function getActor(req: AuthRequest) {
  if (!req.user?.id) {
    throw new AppError('Unauthenticated', 401, 'UNAUTHENTICATED');
  }
  return { id: req.user.id, role: req.user.role };
}

export class ProductsController {
  // ---- Product ----

  list = async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    const products = await productsService.list(storeId);
    return ok(res, { products });
  };

  getById = async (req: Request, res: Response) => {
    const parsed = productIdParamSchema.parse({ params: req.params });
    const product = await productsService.getById(parsed.params.id);
    return ok(res, { product });
  };

  getBySlug = async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    const slug = req.params.slug as string;
    const product = await productsService.getBySlug(storeId, slug);
    return ok(res, { product });
  };

  create = async (req: AuthRequest, res: Response) => {
    const parsed = createProductSchema.parse({
      params: req.params,
      body: req.body,
    });

    // storeId vem da URL, não do body
    const product = await productsService.create(getActor(req), {
      ...parsed.body,
      storeId: parsed.params.storeId,
    });

    return ok(res, { product }, 201);
  };

  update = async (req: AuthRequest, res: Response) => {
    const parsed = updateProductSchema.parse({
      params: req.params,
      body: req.body,
    });

    const product = await productsService.update(
      getActor(req),
      parsed.params.id,
      parsed.body
    );

    return ok(res, { product });
  };

  remove = async (req: AuthRequest, res: Response) => {
    const parsed = productIdParamSchema.parse({ params: req.params });
    await productsService.remove(getActor(req), parsed.params.id);
    return res.status(204).send();
  };

  // ---- Variants ----

  addVariant = async (req: AuthRequest, res: Response) => {
    const parsed = createVariantSchema.parse({
      params: req.params,
      body: req.body,
    });

    const variant = await productsService.addVariant(
      getActor(req),
      parsed.params.id,
      parsed.body
    );

    return ok(res, { variant }, 201);
  };

  updateVariant = async (req: AuthRequest, res: Response) => {
    const parsed = updateVariantSchema.parse({
      params: req.params,
      body: req.body,
    });

    const variant = await productsService.updateVariant(
      getActor(req),
      parsed.params.id,
      parsed.params.variantId,
      parsed.body
    );

    return ok(res, { variant });
  };

  removeVariant = async (req: AuthRequest, res: Response) => {
    const parsed = productVariantParamSchema.parse({ params: req.params });
    await productsService.removeVariant(
      getActor(req),
      parsed.params.id,
      parsed.params.variantId
    );
    return res.status(204).send();
  };

  // ---- Images ----

  addImage = async (req: AuthRequest, res: Response) => {
    const parsed = createImageSchema.parse({
      params: req.params,
      body: req.body,
    });

    const image = await productsService.addImage(
      getActor(req),
      parsed.params.id,
      parsed.body
    );

    return ok(res, { image }, 201);
  };

  removeImage = async (req: AuthRequest, res: Response) => {
    const parsed = productImageParamSchema.parse({ params: req.params });
    await productsService.removeImage(
      getActor(req),
      parsed.params.id,
      parsed.params.imageId
    );
    return res.status(204).send();
  };
}

export const productsController = new ProductsController();