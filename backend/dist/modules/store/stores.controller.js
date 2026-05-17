"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesController = exports.StoresController = void 0;
const response_1 = require("../../shared/http/response");
const AppError_1 = require("../../shared/errors/AppError");
const stores_service_1 = require("./stores.service");
const stores_schemas_1 = require("./stores.schemas");
function getActor(req) {
    if (!req.user?.id) {
        throw new AppError_1.AppError('Unauthenticated', 401, 'UNAUTHENTICATED');
    }
    return {
        id: req.user.id,
        role: req.user.role,
    };
}
class StoresController {
    constructor() {
        this.list = async (req, res) => {
            const stores = await stores_service_1.storesService.list();
            return (0, response_1.ok)(res, { stores });
        };
        this.getById = async (req, res) => {
            const parsed = stores_schemas_1.storeIdParamSchema.parse({ params: req.params });
            const store = await stores_service_1.storesService.getById(parsed.params.id);
            return (0, response_1.ok)(res, { store });
        };
        this.getBySlug = async (req, res) => {
            const parsed = stores_schemas_1.storeSlugParamSchema.parse({ params: req.params });
            const store = await stores_service_1.storesService.getBySlug(parsed.params.slug);
            return (0, response_1.ok)(res, { store });
        };
        this.getMyStores = async (req, res) => {
            const stores = await stores_service_1.storesService.getMyStores(getActor(req));
            return (0, response_1.ok)(res, { stores });
        };
        this.create = async (req, res) => {
            const parsed = stores_schemas_1.createStoreSchema.parse({ body: req.body });
            const store = await stores_service_1.storesService.create(getActor(req), parsed.body);
            return (0, response_1.ok)(res, { store }, 201);
        };
        this.update = async (req, res) => {
            const parsed = stores_schemas_1.updateStoreSchema.parse({
                params: req.params,
                body: req.body,
            });
            const store = await stores_service_1.storesService.update(getActor(req), parsed.params.id, parsed.body);
            return (0, response_1.ok)(res, { store });
        };
        this.updateStatus = async (req, res) => {
            const parsed = stores_schemas_1.updateStoreStatusSchema.parse({
                params: req.params,
                body: req.body,
            });
            const store = await stores_service_1.storesService.updateStatus(getActor(req), parsed.params.id, parsed.body);
            return (0, response_1.ok)(res, { store });
        };
        this.remove = async (req, res) => {
            const parsed = stores_schemas_1.storeIdParamSchema.parse({ params: req.params });
            await stores_service_1.storesService.remove(getActor(req), parsed.params.id);
            return res.status(204).send();
        };
    }
}
exports.StoresController = StoresController;
exports.storesController = new StoresController();
