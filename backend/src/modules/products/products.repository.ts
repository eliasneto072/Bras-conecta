import { prisma } from '../../config/prisma';
import { logger } from '../../shared/utils/logger';
import { IProductRepository } from './products.repository.interfaces';
import { IProduct, IProductFull, IProductVariant, IProductImage } from './products.types';
import {
  CreateProductData,
  UpdateProductData,
  CreateVariantData,
  UpdateVariantData,
  CreateImageData,
} from './products.repository.types';

// select completo — produto + relacionamentos
const fullSelect = {
  id: true,
  storeId: true,
  categoryId: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  priceFrom: true,
  minQty: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: {
      id: true,
      productId: true,
      imageUrl: true,
      position: true,
      createdAt: true,
    },
    orderBy: { position: 'asc' as const },
  },
  variants: {
    select: {
      id: true,
      productId: true,
      sku: true,
      color: true,
      size: true,
      price: true,
      stock: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      whatsapp: true,
      city: true,
      state: true,
      logoUrl: true,
    },
  },
} as const;

// select simples — só o produto
const simpleSelect = {
  id: true,
  storeId: true,
  categoryId: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  priceFrom: true,
  minQty: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ProductsRepository implements IProductRepository {
  async findAll(storeId?: string): Promise<IProductFull[]> {
    try {
      return await prisma.product.findMany({
        where: storeId ? { storeId } : undefined,
        select: fullSelect,
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      logger.error('Erro ao buscar produtos', err);
      throw err;
    }
  }

  async findById(id: string): Promise<IProductFull | null> {
    try {
      return await prisma.product.findUnique({
        where: { id },
        select: fullSelect,
      });
    } catch (err) {
      logger.error('Erro ao buscar produto por id', err);
      throw err;
    }
  }

  async findBySlug(storeId: string, slug: string): Promise<IProductFull | null> {
    try {
      return await prisma.product.findUnique({
        where: { storeId_slug: { storeId, slug } },
        select: fullSelect,
      });
    } catch (err) {
      logger.error('Erro ao buscar produto por slug', err);
      throw err;
    }
  }

  async create(data: CreateProductData): Promise<IProduct> {
    try {
      return await prisma.product.create({
        data: {
          storeId: data.storeId,
          categoryId: data.categoryId,
          name: data.name,
          slug: data.slug,
          description: data.description,
          priceFrom: data.priceFrom,
          minQty: data.minQty ?? 1,
          coverImage: data.coverImage,
        },
        select: simpleSelect,
      });
    } catch (err) {
      logger.error('Erro ao criar produto', err);
      throw err;
    }
  }

  async update(id: string, data: UpdateProductData): Promise<IProduct> {
    try {
      return await prisma.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.priceFrom !== undefined ? { priceFrom: data.priceFrom } : {}),
          ...(data.minQty !== undefined ? { minQty: data.minQty } : {}),
          ...(data.coverImage !== undefined ? { coverImage: data.coverImage } : {}),
        },
        select: simpleSelect,
      });
    } catch (err) {
      logger.error('Erro ao atualizar produto', err);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (err) {
      logger.error('Erro ao deletar produto', err);
      throw err;
    }
  }

  // ---- Variants ----

  async createVariant(data: CreateVariantData): Promise<IProductVariant> {
    try {
      return await prisma.productVariant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          color: data.color,
          size: data.size,
          price: data.price,
          stock: data.stock ?? 0,
        },
      });
    } catch (err) {
      logger.error('Erro ao criar variante', err);
      throw err;
    }
  }

  async updateVariant(variantId: string, data: UpdateVariantData): Promise<IProductVariant> {
    try {
      return await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          ...(data.sku !== undefined ? { sku: data.sku } : {}),
          ...(data.color !== undefined ? { color: data.color } : {}),
          ...(data.size !== undefined ? { size: data.size } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.stock !== undefined ? { stock: data.stock } : {}),
        },
      });
    } catch (err) {
      logger.error('Erro ao atualizar variante', err);
      throw err;
    }
  }

  async deleteVariant(variantId: string): Promise<void> {
    try {
      await prisma.productVariant.delete({ where: { id: variantId } });
    } catch (err) {
      logger.error('Erro ao deletar variante', err);
      throw err;
    }
  }

  // ---- Images ----

  async createImage(data: CreateImageData): Promise<IProductImage> {
    try {
      return await prisma.productImage.create({
        data: {
          productId: data.productId,
          imageUrl: data.imageUrl,
          position: data.position ?? 0,
        },
      });
    } catch (err) {
      logger.error('Erro ao criar imagem', err);
      throw err;
    }
  }

  async deleteImage(imageId: string): Promise<void> {
    try {
      await prisma.productImage.delete({ where: { id: imageId } });
    } catch (err) {
      logger.error('Erro ao deletar imagem', err);
      throw err;
    }
  }
}

export const productsRepository = new ProductsRepository();
