import { AppError } from '../../shared/errors/AppError';
import { storesRepository } from './stores.repository';
import { IStorePublic } from './stores.types';
import { CreateStoreInput, UpdateStoreInput, UpdateStoreStatusInput } from './stores.service.types';
import { CreateStoreData, UpdateStoreData } from './stores.repository.types';
import { Actor } from '../users/users.types';
import { UserRole } from '../../shared/types/enums';

function isAdmin(role?: UserRole) {
  return role === UserRole.ADMIN;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class StoresService {
  private async ensureStoreExists(id: string): Promise<IStorePublic> {
    const store = await storesRepository.findById(id);
    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }
    return store;
  }

  private async ensureIsOwnerOrAdmin(actor: Actor, store: IStorePublic): Promise<void> {
    if (!isAdmin(actor.role) && store.ownerId !== actor.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
  }

  async list(): Promise<IStorePublic[]> {
    return storesRepository.findAll();
  }

  async getById(id: string): Promise<IStorePublic> {
    return this.ensureStoreExists(id);
  }

  async getBySlug(slug: string): Promise<IStorePublic> {
    const store = await storesRepository.findBySlug(slug);
    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }
    return store;
  }

  async getMyStores(actor: Actor): Promise<IStorePublic[]> {
    return storesRepository.findByOwner(actor.id);
  }

  async create(actor: Actor, input: CreateStoreInput): Promise<IStorePublic> {
    // qualquer usuário autenticado pode criar uma loja
    let slug = generateSlug(input.name);

    // garante slug único adicionando sufixo aleatório se necessário
    const existing = await storesRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const data: CreateStoreData = {
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

    return storesRepository.create(data);
  }

  async update(actor: Actor, id: string, input: UpdateStoreInput): Promise<IStorePublic> {
    const store = await this.ensureStoreExists(id);
    await this.ensureIsOwnerOrAdmin(actor, store);

    const data: UpdateStoreData = {
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
      const existing = await storesRepository.findBySlug(newSlug);
      if (existing && existing.id !== id) {
        newSlug = `${newSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }
      data.slug = newSlug;
    }

    return storesRepository.update(id, data);
  }

  // exclusivo para ADMIN — aprovar, suspender, verificar loja
  async updateStatus(actor: Actor, id: string, input: UpdateStoreStatusInput): Promise<IStorePublic> {
    if (!isAdmin(actor.role)) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    await this.ensureStoreExists(id);

    return storesRepository.update(id, {
      status: input.status,
      ...(input.verified !== undefined ? { verified: input.verified } : {}),
    });
  }

  async remove(actor: Actor, id: string): Promise<void> {
    const store = await this.ensureStoreExists(id);
    await this.ensureIsOwnerOrAdmin(actor, store);
    return storesRepository.delete(id);
  }
}

export const storesService = new StoresService();
