import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { storesController } from './stores.controller';

export function storesRouter() {
  const router = Router();

  // rotas públicas
  router.get('/', storesController.list);
  router.get('/slug/:slug', storesController.getBySlug);
  router.get('/:id', storesController.getById);

  // rotas autenticadas
  router.get('/me/stores', authMiddleware, storesController.getMyStores);
  router.post('/', authMiddleware, storesController.create);
  router.patch('/:id', authMiddleware, storesController.update);
  router.delete('/:id', authMiddleware, storesController.remove);

  // exclusivo admin — aprovar/suspender/verificar
  router.patch('/:id/status', authMiddleware, storesController.updateStatus);

  return router;
}
