"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreStatusSchema = exports.updateStoreSchema = exports.createStoreSchema = exports.storeSlugParamSchema = exports.storeIdParamSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../../shared/types/enums");
exports.storeIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
exports.storeSlugParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        slug: zod_1.z.string().min(1),
    }),
});
exports.createStoreSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        description: zod_1.z.string().optional(),
        whatsapp: zod_1.z.string().min(10),
        email: zod_1.z.string().email().optional(),
        city: zod_1.z.string().min(2),
        state: zod_1.z.string().length(2), // ex: "SP"
        logoUrl: zod_1.z.string().url().optional(),
        bannerUrl: zod_1.z.string().url().optional(),
        minOrderValue: zod_1.z.number().positive(),
    }),
});
exports.updateStoreSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().optional(),
        whatsapp: zod_1.z.string().min(10).optional(),
        email: zod_1.z.string().email().optional(),
        city: zod_1.z.string().min(2).optional(),
        state: zod_1.z.string().length(2).optional(),
        logoUrl: zod_1.z.string().url().optional(),
        bannerUrl: zod_1.z.string().url().optional(),
        minOrderValue: zod_1.z.number().positive().optional(),
    })
        .refine((b) => Object.keys(b).length > 0, {
        message: 'At least one field is required',
    }),
});
exports.updateStoreStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(enums_1.StoreStatus),
        verified: zod_1.z.boolean().optional(),
    }),
});
