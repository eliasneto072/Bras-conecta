import { Prisma } from '@prisma/client';
import { StoreStatus } from '../../shared/types/enums';

export type CreateStoreData = {
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  whatsapp: string;
  email?: string;
  city: string;
  state: string;
  logoUrl?: string;
  bannerUrl?: string;
  minOrderValue: Prisma.Decimal | number;
};

export type UpdateStoreData = {
  name?: string;
  slug?: string;
  description?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  bannerUrl?: string;
  minOrderValue?: Prisma.Decimal | number;
  status?: StoreStatus;
  verified?: boolean;
};
