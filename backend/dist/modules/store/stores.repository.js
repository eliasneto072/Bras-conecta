"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storesRepository = exports.StoresRepository = void 0;
const prisma_1 = require("../../config/prisma");
const logger_1 = require("../../shared/utils/logger");
class StoresRepository {
    constructor() {
        this.select = {
            id: true,
            ownerId: true,
            name: true,
            slug: true,
            description: true,
            whatsapp: true,
            email: true,
            city: true,
            state: true,
            logoUrl: true,
            bannerUrl: true,
            minOrderValue: true,
            verified: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        };
    }
    async findAll() {
        try {
            return await prisma_1.prisma.store.findMany({
                select: this.select,
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao buscar lojas', err);
            throw err;
        }
    }
    async findById(id) {
        try {
            return await prisma_1.prisma.store.findUnique({
                where: { id },
                select: this.select,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao buscar loja por id', err);
            throw err;
        }
    }
    async findBySlug(slug) {
        try {
            return await prisma_1.prisma.store.findUnique({
                where: { slug },
                select: this.select,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao buscar loja por slug', err);
            throw err;
        }
    }
    async findByOwner(ownerId) {
        try {
            return await prisma_1.prisma.store.findMany({
                where: { ownerId },
                select: this.select,
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao buscar lojas do usuário', err);
            throw err;
        }
    }
    async create(data) {
        try {
            return await prisma_1.prisma.store.create({
                data: {
                    ownerId: data.ownerId,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    whatsapp: data.whatsapp,
                    email: data.email,
                    city: data.city,
                    state: data.state,
                    logoUrl: data.logoUrl,
                    bannerUrl: data.bannerUrl,
                    minOrderValue: data.minOrderValue,
                },
                select: this.select,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao criar loja', err);
            throw err;
        }
    }
    async update(id, data) {
        try {
            return await prisma_1.prisma.store.update({
                where: { id },
                data: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.slug !== undefined ? { slug: data.slug } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp } : {}),
                    ...(data.email !== undefined ? { email: data.email } : {}),
                    ...(data.city !== undefined ? { city: data.city } : {}),
                    ...(data.state !== undefined ? { state: data.state } : {}),
                    ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
                    ...(data.bannerUrl !== undefined ? { bannerUrl: data.bannerUrl } : {}),
                    ...(data.minOrderValue !== undefined ? { minOrderValue: data.minOrderValue } : {}),
                    ...(data.status !== undefined ? { status: data.status } : {}),
                    ...(data.verified !== undefined ? { verified: data.verified } : {}),
                },
                select: this.select,
            });
        }
        catch (err) {
            logger_1.logger.error('Erro ao atualizar loja', err);
            throw err;
        }
    }
    async delete(id) {
        try {
            await prisma_1.prisma.store.delete({ where: { id } });
        }
        catch (err) {
            logger_1.logger.error('Erro ao deletar loja', err);
            throw err;
        }
    }
}
exports.StoresRepository = StoresRepository;
exports.storesRepository = new StoresRepository();
