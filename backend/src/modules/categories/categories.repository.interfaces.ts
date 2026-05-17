import { ICategory } from './categories.types';
import { CreateCategoryData, UpdateCategoryData } from './categories.repository.types';

export interface ICategoryRepository {
  findAll(storeId: string): Promise<ICategory[]>;
  findById(id: string): Promise<ICategory | null>;
  findBySlug(storeId: string, slug: string): Promise<ICategory | null>;
  create(data: CreateCategoryData): Promise<ICategory>;
  update(id: string, data: UpdateCategoryData): Promise<ICategory>;
  delete(id: string): Promise<void>;
}