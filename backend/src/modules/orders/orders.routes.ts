import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { ordersController } from './orders.controller';

export function ordersRouter() {
  const router = Router();

  // todas as rotas exigem autenticação
  router.get('/me', authMiddleware, ordersController.listMyOrders);                          // GET  /orders/me
  router.get('/store/:storeId', authMiddleware, ordersController.listStoreOrders);           // GET  /orders/store/:storeId
  router.get('/:id', authMiddleware, ordersController.getById);                              // GET  /orders/:id
  router.post('/', authMiddleware, ordersController.create);                                 // POST /orders
  router.patch('/:id/status', authMiddleware, ordersController.updateStatus);                // PATCH /orders/:id/status

  return router;
}
