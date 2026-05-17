import { AppError } from '../../shared/errors/AppError';
import { categoriesRepository } from './categories.repository';
import { storesRepository } from '../stores/stores.repository';
import { ICategory } from './categories.types';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.service.types';
import { Actor } from '../users/users.types';
import { UserRole } from '../../shared/types/enums';

function isAdmin(role?: UserRole) {
  return role === UserRole.ADMIN;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class CategoriesService {
  private async ensureCategoryExists(id: string): Promise<ICategory> {
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }
    return category;
  }

  private async ensureStoreOwnerOrAdmin(actor: Actor, storeId: string): Promise<void> {
    if (isAdmin(actor.role)) return;

    const store = await storesRepository.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }
    if (store.ownerId !== actor.id) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
  }

  async list(storeId: string): Promise<ICategory[]> {
    return categoriesRepository.findAll(storeId);
  }

  async getById(id: string): Promise<ICategory> {
    return this.ensureCategoryExists(id);
  }

  async create(actor: Actor, storeId: string, input: CreateCategoryInput): Promise<ICategory> {
    await this.ensureStoreOwnerOrAdmin(actor, storeId);

    const slug = generateSlug(input.name);

    const existing = await categoriesRepository.findBySlug(storeId, slug);
    if (existing) {
      throw new AppError('Category already exists', 409, 'CATEGORY_ALREADY_EXISTS');
    }

    return categoriesRepository.create({ storeId, name: input.name, slug });
  }

  async update(actor: Actor, id: string, input: UpdateCategoryInput): Promise<ICategory> {
    const category = await this.ensureCategoryExists(id);
    await this.ensureStoreOwnerOrAdmin(actor, category.storeId);

    const data: { name?: string; slug?: string } = {};

    if (input.name) {
      const newSlug = generateSlug(input.name);
      const existing = await categoriesRepository.findBySlug(category.storeId, newSlug);
      if (existing && existing.id !== id) {
        throw new AppError('Category already exists', 409, 'CATEGORY_ALREADY_EXISTS');
      }
      data.name = input.name;
      data.slug = newSlug;
    }

    return categoriesRepository.update(id, data);
  }

  async remove(actor: Actor, id: string): Promise<void> {
    const category = await this.ensureCategoryExists(id);
    await this.ensureStoreOwnerOrAdmin(actor, category.storeId);
    return categoriesRepository.delete(id);
  }
}

export const categoriesService = new CategoriesService();