"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesService = exports.StoresService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const stores_repository_1 = require("./stores.repository");
const enums_1 = require("../../shared/types/enums");
function isAdmin(role) {
    return role === enums_1.UserRole.ADMIN;
}
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}
class StoresService {
    async ensureStoreExists(id) {
        const store = await stores_repository_1.storesRepository.findById(id);
        if (!store) {
            throw new AppError_1.AppError('Store not found', 404, 'STORE_NOT_FOUND');
        }
        return store;
    }
    async ensureIsOwnerOrAdmin(actor, store) {
        if (!isAdmin(actor.role) && store.ownerId !== actor.id) {
            throw new AppError_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
    }
    async list() {
        return stores_repository_1.storesRepository.findAll();
    }
    async getById(id) {
        return this.ensureStoreExists(id);
    }
    async getBySlug(slug) {
        const store = await stores_repository_1.storesRepository.findBySlug(slug);
        if (!store) {
            throw new AppError_1.AppError('Store not found', 404, 'STORE_NOT_FOUND');
        }
        return store;
    }
    async getMyStores(actor) {
        return stores_repository_1.storesRepository.findByOwner(actor.id);
    }
    async create(actor, input) {
        // qualquer usuário autenticado pode criar uma loja
        let slug = generateSlug(input.name);
        // garante slug único adicionando sufixo aleatório se necessário
        const existing = await stores_repository_1.storesRepository.findBySlug(slug);
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        }
        const data = {
            ownerId: actor.id,
            name: input.name,
            slug,
            description: input.description,
            whatsapp: input.whatsapp,
            email: input.email,
            city: input.city,
            state: input.state,
            logoUrl: input.logoUrl,
            bannerUrl: input.bannerUrl,
            minOrderValue: input.minOrderValue,
        };
        return stores_repository_1.storesRepository.create(data);
    }
    async update(actor, id, input) {
        const store = await this.ensureStoreExists(id);
        await this.ensureIsOwnerOrAdmin(actor, store);
        const data = {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
            ...(input.email !== undefined ? { email: input.email } : {}),
            ...(input.city !== undefined ? { city: input.city } : {}),
            ...(input.state !== undefined ? { state: input.state } : {}),
            ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
            ...(input.bannerUrl !== undefined ? { bannerUrl: input.bannerUrl } : {}),
            ...(input.minOrderValue !== undefined ? { minOrderValue: input.minOrderValue } : {}),
        };
        // se o nome mudou, regenera o slug
        if (input.name) {
            let newSlug = generateSlug(input.name);
            const existing = await stores_repository_1.storesRepository.findBySlug(newSlug);
            if (existing && existing.id !== id) {
                newSlug = `${newSlug}-${Math.random().toString(36).slice(2, 6)}`;
            }
            data.slug = newSlug;
        }
        return stores_repository_1.storesRepository.update(id, data);
    }
    // exclusivo para ADMIN — aprovar, suspender, verificar loja
    async updateStatus(actor, id, input) {
        if (!isAdmin(actor.role)) {
            throw new AppError_1.AppError('Forbidden', 403, 'FORBIDDEN');
        }
        await this.ensureStoreExists(id);
        return stores_repository_1.storesRepository.update(id, {
            status: input.status,
            ...(input.verified !== undefined ? { verified: input.verified } : {}),
        });
    }
    async remove(actor, id) {
        const store = await this.ensureStoreExists(id);
        await this.ensureIsOwnerOrAdmin(actor, store);
        return stores_repository_1.storesRepository.delete(id);
    }
}
exports.StoresService = StoresService;
exports.storesService = new StoresService();
