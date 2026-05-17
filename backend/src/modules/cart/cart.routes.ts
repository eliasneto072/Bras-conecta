import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { cartController } from './cart.controller';

export function cartRouter() {
  const router = Router();

  // todas as rotas de carrinho exigem autenticação
  router.get('/', authMiddleware, cartController.get);                              // GET  /cart
  router.post('/items', authMiddleware, cartController.addItem);                    // POST /cart/items
  router.patch('/items/:variantId', authMiddleware, cartController.updateItem);     // PATCH /cart/items/:variantId
  router.delete('/items/:variantId', authMiddleware, cartController.removeItem);    // DELETE /cart/items/:variantId
  router.delete('/', authMiddleware, cartController.clear);                         // DELETE /cart

  return router;
}
