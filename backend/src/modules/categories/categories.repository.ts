import { prisma } from '../../config/prisma';
import { logger } from '../../shared/utils/logger';
import { ICategoryRepository } from './categories.repository.interfaces';
import { ICategory } from './categories.types';
import { CreateCategoryData, UpdateCategoryData } from './categories.repository.types';

const select = {
  id: true,
  storeId: true,
  name: true,
  slug: true,
  createdAt: true,
} as const;

export class CategoriesRepository implements ICategoryRepository {
  async findAll(storeId: string): Promise<ICategory[]> {
    try {
      return await prisma.category.findMany({
        where: { storeId },
        select,
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      logger.error('Erro ao buscar categorias', err);
      throw err;
    }
  }

  async findById(id: string): Promise<ICategory | null> {
    try {
      return await prisma.category.findUnique({
        where: { id },
        select,
      });
    } catch (err) {
      logger.error('Erro ao buscar categoria por id', err);
      throw err;
    }
  }

  async findBySlug(storeId: string, slug: string): Promise<ICategory | null> {
    try {
      return await prisma.category.findUnique({
        where: { storeId_slug: { storeId, slug } },
        select,
      });
    } catch (err) {
      logger.error('Erro ao buscar categoria por slug', err);
      throw err;
    }
  }

  async create(data: CreateCategoryData): Promise<ICategory> {
    try {
      return await prisma.category.create({
        data: {
          storeId: data.storeId,
          name: data.name,
          slug: data.slug,
        },
        select,
      });
    } catch (err) {
      logger.error('Erro ao criar categoria', err);
      throw err;
    }
  }

  async update(id: string, data: UpdateCategoryData): Promise<ICategory> {
    try {
      return await prisma.category.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
        },
        select,
      });
    } catch (err) {
      logger.error('Erro ao atualizar categoria', err);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.category.delete({ where: { id } });
    } catch (err) {
      logger.error('Erro ao deletar categoria', err);
      throw err;
    }
  }
}

export const categoriesRepository = new CategoriesRepository();