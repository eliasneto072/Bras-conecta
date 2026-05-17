"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsController = exports.ProductsController = void 0;
const response_1 = require("../../shared/http/response");
const AppError_1 = require("../../shared/errors/AppError");
const products_service_1 = require("./products.service");
const products_schemas_1 = require("./products.schemas");
function getActor(req) {
    if (!req.user?.id) {
        throw new AppError_1.AppError('Unauthenticated', 401, 'UNAUTHENTICATED');
    }
    return { id: req.user.id, role: req.user.role };
}
class ProductsController {
    constructor() {
        // ---- Product ----
        this.list = async (req, res) => {
            const storeId = req.params.storeId;
            const products = await products_service_1.productsService.list(storeId);
            return (0, response_1.ok)(res, { products });
        };
        this.getById = async (req, res) => {
            const parsed = products_schemas_1.productIdParamSchema.parse({ params: req.params });
            const product = await products_service_1.productsService.getById(parsed.params.id);
            return (0, response_1.ok)(res, { product });
        };
        this.getBySlug = async (req, res) => {
            const storeId = req.params.storeId;
            const slug = req.params.slug;
            const product = await products_service_1.productsService.getBySlug(storeId, slug);
            return (0, response_1.ok)(res, { product });
        };
        this.create = async (req, res) => {
            const parsed = products_schemas_1.createProductSchema.parse({
                params: req.params,
                body: req.body,
            });
            // storeId vem da URL, não do body
            const product = await products_service_1.productsService.create(getActor(req), {
                ...parsed.body,
                storeId: parsed.params.storeId,
            });
            return (0, response_1.ok)(res, { product }, 201);
        };
        this.update = async (req, res) => {
            const parsed = products_schemas_1.updateProductSchema.parse({
                params: req.params,
                body: req.body,
            });
            const product = await products_service_1.productsService.update(getActor(req), parsed.params.id, parsed.body);
            return (0, response_1.ok)(res, { product });
        };
        this.remove = async (req, res) => {
            const parsed = products_schemas_1.productIdParamSchema.parse({ params: req.params });
            await products_service_1.productsService.remove(getActor(req), parsed.params.id);
            return res.status(204).send();
        };
        // ---- Variants ----
        this.addVariant = async (req, res) => {
            const parsed = products_schemas_1.createVariantSchema.parse({
                params: req.params,
                body: req.body,
            });
            const variant = await products_service_1.productsService.addVariant(getActor(req), parsed.params.id, parsed.body);
            return (0, response_1.ok)(res, { variant }, 201);
        };
        this.updateVariant = async (req, res) => {
            const parsed = products_schemas_1.updateVariantSchema.parse({
                params: req.params,
                body: req.body,
            });
            const variant = await products_service_1.productsService.updateVariant(getActor(req), parsed.params.id, parsed.params.variantId, parsed.body);
            return (0, response_1.ok)(res, { variant });
        };
        this.removeVariant = async (req, res) => {
            const parsed = products_schemas_1.productVariantParamSchema.parse({ params: req.params });
            await products_service_1.productsService.removeVariant(getActor(req), parsed.params.id, parsed.params.variantId);
            return res.status(204).send();
        };
        // ---- Images ----
        this.addImage = async (req, res) => {
            const parsed = products_schemas_1.createImageSchema.parse({
                params: req.params,
                body: req.body,
            });
            const image = await products_service_1.productsService.addImage(getActor(req), parsed.params.id, parsed.body);
            return (0, response_1.ok)(res, { image }, 201);
        };
        this.removeImage = async (req, res) => {
            const parsed = products_schemas_1.productImageParamSchema.parse({ params: req.params });
            await products_service_1.productsService.removeImage(getActor(req), parsed.params.id, parsed.params.imageId);
            return res.status(204).send();
        };
    }
}
exports.ProductsController = ProductsController;
exports.productsController = new ProductsController();
