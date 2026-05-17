import { IStorePublic } from './stores.types';
import { CreateStoreData, UpdateStoreData } from './stores.repository.types';

export interface IStoreRepository {
  findAll(): Promise<IStorePublic[]>;
  findById(id: string): Promise<IStorePublic | null>;
  findBySlug(slug: string): Promise<IStorePublic | null>;
  findByOwner(ownerId: string): Promise<IStorePublic[]>;
  create(data: CreateStoreData): Promise<IStorePublic>;
  update(id: string, data: UpdateStoreData): Promise<IStorePublic>;
  delete(id: string): Promise<void>;
}
