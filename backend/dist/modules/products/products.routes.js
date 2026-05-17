"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = productsRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const products_controller_1 = require("./products.controller");
function productsRouter() {
    const router = (0, express_1.Router)({ mergeParams: true }); // mergeParams para herdar :storeId da rota pai
    // rotas públicas
    router.get('/', products_controller_1.productsController.list); // GET /stores/:storeId/products
    router.get('/slug/:slug', products_controller_1.productsController.getBySlug); // GET /stores/:storeId/products/slug/:slug
    router.get('/:id', products_controller_1.productsController.getById); // GET /stores/:storeId/products/:id
    // produto — autenticado
    router.post('/', auth_middleware_1.authMiddleware, products_controller_1.productsController.create); // POST /stores/:storeId/products
    router.patch('/:id', auth_middleware_1.authMiddleware, products_controller_1.productsController.update); // PATCH /stores/:storeId/products/:id
    router.delete('/:id', auth_middleware_1.authMiddleware, products_controller_1.productsController.remove); // DELETE /stores/:storeId/products/:id
    // variantes — autenticado
    router.post('/:id/variants', auth_middleware_1.authMiddleware, products_controller_1.productsController.addVariant); // POST /stores/:storeId/products/:id/variants
    router.patch('/:id/variants/:variantId', auth_middleware_1.authMiddleware, products_controller_1.productsController.updateVariant); // PATCH /stores/:storeId/products/:id/variants/:variantId
    router.delete('/:id/variants/:variantId', auth_middleware_1.authMiddleware, products_controller_1.productsController.removeVariant); // DELETE /stores/:storeId/products/:id/variants/:variantId
    // imagens — autenticado
    router.post('/:id/images', auth_middleware_1.authMiddleware, products_controller_1.productsController.addImage); // POST /stores/:storeId/products/:id/images
    router.delete('/:id/images/:imageId', auth_middleware_1.authMiddleware, products_controller_1.productsController.removeImage); // DELETE /stores/:storeId/products/:id/images/:imageId
    return router;
}
