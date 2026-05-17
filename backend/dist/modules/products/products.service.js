"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsService = exports.ProductsService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const products_repository_1 = require("./products.repository");
const stores_repository_1 = require("../stores/stores.repository");
const enums_1 = require("../../shared/types/enums");
function isAdmin(role) {
    return role === enums_1.UserRole.ADMIN;
}
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}
class ProductsService {
    // garante que o produto existe e retorna ele
    async ensureProductExists(id) {
        const product = await products_repository_1.productsRepository.findById(id);
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }
        return product;
    }
    // garante que o actor é dono da loja ou admin
    async ensureStoreOwnerOrAdmin(actor, storeId) {
        if (isAdmin(actor.role))
            return;
        const store = await stores_repository_1.storesRepository.findById(storeId);
        if (!store) {
            throw new AppError_1.AppError('Store not found', 404, 'STORE_NOT_FOUND');
        }
        if (store.ownerId !== actor.id) {
            throw new AppError_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
    }
    // ---- Product ----
    async list(storeId) {
        return products_repository_1.productsRepository.findAll(storeId);
    }
    async getById(id) {
        return this.ensureProductExists(id);
    }
    async getBySlug(storeId, slug) {
        const product = await products_repository_1.productsRepository.findBySlug(storeId, slug);
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
        }
        return product;
    }
    async create(actor, input) {
        await this.ensureStoreOwnerOrAdmin(actor, input.storeId);
        let slug = generateSlug(input.name);
        // garante slug único dentro da loja
        const existing = await products_repository_1.productsRepository.findBySlug(input.storeId, slug);
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        }
        return products_repository_1.productsRepository.create({
            storeId: input.storeId,
            categoryId: input.categoryId,
            name: input.name,
            slug,
            description: input.description,
            priceFrom: input.priceFrom,
            minQty: input.minQty,
            coverImage: input.coverImage,
        });
    }
    async update(actor, id, input) {
        const product = await this.ensureProductExists(id);
        await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
        let slug;
        if (input.name) {
            const newSlug = generateSlug(input.name);
            const existing = await products_repository_1.productsRepository.findBySlug(product.storeId, newSlug);
            slug = existing && existing.id !== id
                ? `${newSlug}-${Math.random().toString(36).slice(2, 6)}`
                : newSlug;
        }
        return products_repository_1.productsRepository.update(id, { ...input, ...(slug ? { slug } : {}) });
    }
    async remove(actor, id) {
        const product = await this.ensureProductExists(id);
        await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
        return products_repository_1.productsRepository.delete(id);
    }
    // ---- Variants ----
    async addVariant(actor, productId, input) {
        const product = await this.ensureProductExists(productId);
        await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
        return products_repository_1.productsRepository.createVariant({
            productId,
            ...input,
        });
    }
    async updateVariant(actor, productId, variantId, input) {
        const product = await this.ensureProductExists(productId);
        await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
        return products_repository_1.productsRepository.updateVariant(variantId, input);
    }
    async removeVariant(actor, productId, variantId) {
        const product = await this.ensureProductExists(productId);
        await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
        return products_repository_1.productsRepository.deleteVariant(variantId);
    }
    // ---- Images ----
    async addImage(actor, productId, input) {
        const product = await this.ensureProductExists(productId);
        await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
        return products_repository_1.productsRepository.createImage({
            productId,
            ...input,
        });
    }
    async removeImage(actor, productId, imageId) {
        const product = await this.ensureProductExists(productId);
        await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
        return products_repository_1.productsRepository.deleteImage(imageId);
    }
}
exports.ProductsService = ProductsService;
exports.productsService = new ProductsService();
