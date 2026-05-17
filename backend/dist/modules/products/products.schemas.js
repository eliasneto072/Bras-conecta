"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageSchema = exports.updateVariantSchema = exports.createVariantSchema = exports.updateProductSchema = exports.createProductSchema = exports.productImageParamSchema = exports.productVariantParamSchema = exports.productIdParamSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../shared/types/enums");
exports.productIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
        id: zod_1.z.string().min(1),
    }),
});
exports.productVariantParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
        id: zod_1.z.string().min(1),
        variantId: zod_1.z.string().min(1),
    }),
});
exports.productImageParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
        id: zod_1.z.string().min(1),
        imageId: zod_1.z.string().min(1),
    }),
});
exports.createProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        categoryId: zod_1.z.string().optional(),
        name: zod_1.z.string().min(2),
        description: zod_1.z.string().optional(),
        priceFrom: zod_1.z.number().positive(),
        minQty: zod_1.z.number().int().positive().optional(),
        coverImage: zod_1.z.string().url().optional(),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z
        .object({
        categoryId: zod_1.z.string().nullable().optional(),
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(enums_1.ProductStatus).optional(),
        priceFrom: zod_1.z.number().positive().optional(),
        minQty: zod_1.z.number().int().positive().optional(),
        coverImage: zod_1.z.string().url().optional(),
    })
        .refine((b) => Object.keys(b).length > 0, {
        message: 'At least one field is required',
    }),
});
exports.createVariantSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        sku: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        size: zod_1.z.string().optional(),
        price: zod_1.z.number().positive(),
        stock: zod_1.z.number().int().min(0).optional(),
    }),
});
exports.updateVariantSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
        id: zod_1.z.string().min(1),
        variantId: zod_1.z.string().min(1),
    }),
    body: zod_1.z
        .object({
        sku: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        size: zod_1.z.string().optional(),
        price: zod_1.z.number().positive().optional(),
        stock: zod_1.z.number().int().min(0).optional(),
    })
        .refine((b) => Object.keys(b).length > 0, {
        message: 'At least one field is required',
    }),
});
exports.createImageSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        imageUrl: zod_1.z.string().url(),
        position: zod_1.z.number().int().min(0).optional(),
    }),
});
