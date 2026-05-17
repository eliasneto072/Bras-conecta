import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { productsController } from './products.controller';

export function productsRouter() {
  const router = Router({ mergeParams: true }); // mergeParams para herdar :storeId da rota pai

  // rotas públicas
  router.get('/', productsController.list);                        // GET /stores/:storeId/products
  router.get('/slug/:slug', productsController.getBySlug);         // GET /stores/:storeId/products/slug/:slug
  router.get('/:id', productsController.getById);                  // GET /stores/:storeId/products/:id

  // produto — autenticado
  router.post('/', authMiddleware, productsController.create);      // POST /stores/:storeId/products
  router.patch('/:id', authMiddleware, productsController.update);  // PATCH /stores/:storeId/products/:id
  router.delete('/:id', authMiddleware, productsController.remove); // DELETE /stores/:storeId/products/:id

  // variantes — autenticado
  router.post('/:id/variants', authMiddleware, productsController.addVariant);                    // POST /stores/:storeId/products/:id/variants
  router.patch('/:id/variants/:variantId', authMiddleware, productsController.updateVariant);     // PATCH /stores/:storeId/products/:id/variants/:variantId
  router.delete('/:id/variants/:variantId', authMiddleware, productsController.removeVariant);    // DELETE /stores/:storeId/products/:id/variants/:variantId

  // imagens — autenticado
  router.post('/:id/images', authMiddleware, productsController.addImage);                        // POST /stores/:storeId/products/:id/images
  router.delete('/:id/images/:imageId', authMiddleware, productsController.removeImage);          // DELETE /stores/:storeId/products/:id/images/:imageId

  return router;
}