import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { categoriesController } from './categories.controller';

export function categoriesRouter() {
  const router = Router({ mergeParams: true }); // herda :storeId da rota pai

  // públicas
  router.get('/', categoriesController.list);       // GET /stores/:storeId/categories
  router.get('/:id', categoriesController.getById); // GET /stores/:storeId/categories/:id

  // autenticadas
  router.post('/', authMiddleware, categoriesController.create);         // POST /stores/:storeId/categories
  router.patch('/:id', authMiddleware, categoriesController.update);     // PATCH /stores/:storeId/categories/:id
  router.delete('/:id', authMiddleware, categoriesController.remove);    // DELETE /stores/:storeId/categories/:id

  return router;
}