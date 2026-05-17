
import { Prisma } from '@prisma/client';
import { StoreStatus } from '../../shared/types/enums';

export interface IStore {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp: string;
  email: string | null;
  city: string;
  state: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  minOrderValue: Prisma.Decimal;
  verified: boolean;
  status: StoreStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type IStorePublic = IStore;