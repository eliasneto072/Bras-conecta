"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesRouter = storesRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const stores_controller_1 = require("./stores.controller");
function storesRouter() {
    const router = (0, express_1.Router)();
    // rotas públicas
    router.get('/', stores_controller_1.storesController.list);
    router.get('/slug/:slug', stores_controller_1.storesController.getBySlug);
    router.get('/:id', stores_controller_1.storesController.getById);
    // rotas autenticadas
    router.get('/me/stores', auth_middleware_1.authMiddleware, stores_controller_1.storesController.getMyStores);
    router.post('/', auth_middleware_1.authMiddleware, stores_controller_1.storesController.create);
    router.patch('/:id', auth_middleware_1.authMiddleware, stores_controller_1.storesController.update);
    router.delete('/:id', auth_middleware_1.authMiddleware, stores_controller_1.storesController.remove);
    // exclusivo admin — aprovar/suspender/verificar
    router.patch('/:id/status', auth_middleware_1.authMiddleware, stores_controller_1.storesController.updateStatus);
    return router;
}
