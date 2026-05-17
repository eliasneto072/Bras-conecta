import { AppError } from '../../shared/errors/AppError';
import { productsRepository } from './products.repository';
import { storesRepository } from '../stores/stores.repository';
import { IProduct, IProductFull, IProductVariant, IProductImage } from './products.types';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  CreateImageInput,
} from './products.service.types';
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

export class ProductsService {
  // garante que o produto existe e retorna ele
  private async ensureProductExists(id: string): Promise<IProductFull> {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  // garante que o actor é dono da loja ou admin
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

  // ---- Product ----

  async list(storeId?: string): Promise<IProductFull[]> {
    return productsRepository.findAll(storeId);
  }

  async getById(id: string): Promise<IProductFull> {
    return this.ensureProductExists(id);
  }

  async getBySlug(storeId: string, slug: string): Promise<IProductFull> {
    const product = await productsRepository.findBySlug(storeId, slug);
    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async create(actor: Actor, input: CreateProductInput): Promise<IProduct> {
    await this.ensureStoreOwnerOrAdmin(actor, input.storeId);

    let slug = generateSlug(input.name);

    // garante slug único dentro da loja
    const existing = await productsRepository.findBySlug(input.storeId, slug);
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    return productsRepository.create({
      storeId: input.storeId,
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description,
      priceFrom: input.priceFrom,
      minQty: input.minQty,
      coverImage: input.coverImage,
    });
  }

  async update(actor: Actor, id: string, input: UpdateProductInput): Promise<IProduct> {
    const product = await this.ensureProductExists(id);
    await this.ensureStoreOwnerOrAdmin(actor, product.storeId);

    let slug: string | undefined;

    if (input.name) {
      const newSlug = generateSlug(input.name);
      const existing = await productsRepository.findBySlug(product.storeId, newSlug);
      slug = existing && existing.id !== id
        ? `${newSlug}-${Math.random().toString(36).slice(2, 6)}`
        : newSlug;
    }

    return productsRepository.update(id, { ...input, ...(slug ? { slug } : {}) });
  }

  async remove(actor: Actor, id: string): Promise<void> {
    const product = await this.ensureProductExists(id);
    await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
    return productsRepository.delete(id);
  }

  // ---- Variants ----

  async addVariant(actor: Actor, productId: string, input: CreateVariantInput): Promise<IProductVariant> {
    const product = await this.ensureProductExists(productId);
    await this.ensureStoreOwnerOrAdmin(actor, product.storeId);

    return productsRepository.createVariant({
      productId,
      ...input,
    });
  }

  async updateVariant(
    actor: Actor,
    productId: string,
    variantId: string,
    input: UpdateVariantInput
  ): Promise<IProductVariant> {
    const product = await this.ensureProductExists(productId);
    await this.ensureStoreOwnerOrAdmin(actor, product.storeId);

    return productsRepository.updateVariant(variantId, input);
  }

  async removeVariant(actor: Actor, productId: string, variantId: string): Promise<void> {
    const product = await this.ensureProductExists(productId);
    await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
    return productsRepository.deleteVariant(variantId);
  }

  // ---- Images ----

  async addImage(actor: Actor, productId: string, input: CreateImageInput): Promise<IProductImage> {
    const product = await this.ensureProductExists(productId);
    await this.ensureStoreOwnerOrAdmin(actor, product.storeId);

    return productsRepository.createImage({
      productId,
      ...input,
    });
  }

  async removeImage(actor: Actor, productId: string, imageId: string): Promise<void> {
    const product = await this.ensureProductExists(productId);
    await this.ensureStoreOwnerOrAdmin(actor, product.storeId);
    return productsRepository.deleteImage(imageId);
  }
}

export const productsService = new ProductsService();
