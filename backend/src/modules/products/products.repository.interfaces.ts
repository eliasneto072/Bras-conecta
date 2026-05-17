import { IProduct, IProductFull } from './products.types';
import {
  CreateProductData,
  UpdateProductData,
  CreateVariantData,
  UpdateVariantData,
  CreateImageData,
} from './products.repository.types';
import { IProductVariant, IProductImage } from './products.types';

export interface IProductRepository {
  findAll(storeId?: string): Promise<IProductFull[]>;
  findById(id: string): Promise<IProductFull | null>;
  findBySlug(storeId: string, slug: string): Promise<IProductFull | null>;
  create(data: CreateProductData): Promise<IProduct>;
  update(id: string, data: UpdateProductData): Promise<IProduct>;
  delete(id: string): Promise<void>;

  // variants
  createVariant(data: CreateVariantData): Promise<IProductVariant>;
  updateVariant(variantId: string, data: UpdateVariantData): Promise<IProductVariant>;
  deleteVariant(variantId: string): Promise<void>;

  // images
  createImage(data: CreateImageData): Promise<IProductImage>;
  deleteImage(imageId: string): Promise<void>;
}