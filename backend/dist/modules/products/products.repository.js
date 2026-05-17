"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRepository = exports.ProductsRepository = void 0;
const prisma_1 = require("../../config/prisma");
const logger_1 = require("../../shared/utils/logger");
// select completo — produto + relacionamentos
const fullSelect = {
    id: true,
    storeId: true,
    categoryId: true,
    name: true,
    slug: true,
    description: true,
    status: true,
    priceFrom: true,
    minQty: true,
    coverImage: true,
    createdAt: true,
    updatedAt: true,
    images: {
        select: {
            id: true,
            productId: true,
            imageUrl: true,
            position: true,
            createdAt: true,
        },
        orderBy: { position: 'asc' },
    },
    variants: {
        select: {
            id: true,
            productId: true,
            sku: true,
            color: true,
            size: true,
            price: true,
            stock: true,
            createdAt: true,
            updatedAt: true,
        },
    },
    category: {
        select: {
            id: true,
            name: true,
            slug: true,
        },
    },
    store: {
        select: {
            id: true,
            name: true,
            slug: true,
            whatsapp: true,
            city: true,
            state: true,
            logoUrl: true,
        },
    },
};
// select simples — só o produto
const simpleSelect = {
    id: true,
    storeId: true,
    categoryId: true,
    name: true,
    slug: true,
    description: true,
    status: true,
    priceFrom: true,
    minQty: true,
    coverImage: true,
    createdAt: true,
    updatedAt: true,
};
class ProductsRepository {
    async findAll(storeId) {
        try {
            return await prisma_1.prisma.product.findMany({
                where: storeId ? { storeId } : undefined,
                select: fullSelect,
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao buscar produtos', err);
            throw err;
        }
    }
    async findById(id) {
        try {
            return await prisma_1.prisma.product.findUnique({
                where: { id },
                select: fullSelect,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao buscar produto por id', err);
            throw err;
        }
    }
    async findBySlug(storeId, slug) {
        try {
            return await prisma_1.prisma.product.findUnique({
                where: { storeId_slug: { storeId, slug } },
                select: fullSelect,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao buscar produto por slug', err);
            throw err;
        }
    }
    async create(data) {
        try {
            return await prisma_1.prisma.product.create({
                data: {
                    storeId: data.storeId,
                    categoryId: data.categoryId,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    priceFrom: data.priceFrom,
                    minQty: data.minQty ?? 1,
                    coverImage: data.coverImage,
                },
                select: simpleSelect,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao criar produto', err);
            throw err;
        }
    }
    async update(id, data) {
        try {
            return await prisma_1.prisma.product.update({
                where: { id },
                data: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.slug !== undefined ? { slug: data.slug } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
                    ...(data.status !== undefined ? { status: data.status } : {}),
                    ...(data.priceFrom !== undefined ? { priceFrom: data.priceFrom } : {}),
                    ...(data.minQty !== undefined ? { minQty: data.minQty } : {}),
                    ...(data.coverImage !== undefined ? { coverImage: data.coverImage } : {}),
                },
                select: simpleSelect,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao atualizar produto', err);
            throw err;
        }
    }
    async delete(id) {
        try {
            await prisma_1.prisma.product.delete({ where: { id } });
        }
        catch (err) {
            logger_1.logger.error('Erro ao deletar produto', err);
            throw err;
        }
    }
    // ---- Variants ----
    async createVariant(data) {
        try {
            return await prisma_1.prisma.productVariant.create({
                data: {
                    productId: data.productId,
                    sku: data.sku,
                    color: data.color,
                    size: data.size,
                    price: data.price,
                    stock: data.stock ?? 0,
                },
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao criar variante', err);
            throw err;
        }
    }
    async updateVariant(variantId, data) {
        try {
            return await prisma_1.prisma.productVariant.update({
                where: { id: variantId },
                data: {
                    ...(data.sku !== undefined ? { sku: data.sku } : {}),
                    ...(data.color !== undefined ? { color: data.color } : {}),
                    ...(data.size !== undefined ? { size: data.size } : {}),
                    ...(data.price !== undefined ? { price: data.price } : {}),
                    ...(data.stock !== undefined ? { stock: data.stock } : {}),
                },
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao atualizar variante', err);
            throw err;
        }
    }
    async deleteVariant(variantId) {
        try {
            await prisma_1.prisma.productVariant.delete({ where: { id: variantId } });
        }
        catch (err) {
            logger_1.logger.error('Erro ao deletar variante', err);
            throw err;
        }
    }
    // ---- Images ----
    async createImage(data) {
        try {
            return await prisma_1.prisma.productImage.create({
                data: {
                    productId: data.productId,
                    imageUrl: data.imageUrl,
                    position: data.position ?? 0,
                },
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao criar imagem', err);
            throw err;
        }
    }
    async deleteImage(imageId) {
        try {
            await prisma_1.prisma.productImage.delete({ where: { id: imageId } });
        }
        catch (err) {
            logger_1.logger.error('Erro ao deletar imagem', err);
            throw err;
        }
    }
}
exports.ProductsRepository = ProductsRepository;
exports.productsRepository = new ProductsRepository();
