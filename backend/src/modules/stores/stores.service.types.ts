import { StoreStatus } from '../../shared/types/enums';

export type CreateStoreInput = {
  name: string;
  description?: string;
  whatsapp: string;
  email?: string;
  city: string;
  state: string;
  logoUrl?: string;
  bannerUrl?: string;
  minOrderValue: number;
};

export type UpdateStoreInput = {
  name?: string;
  description?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  logoUrl?: string;
  bannerUrl?: string;
  minOrderValue?: number;
};

export type UpdateStoreStatusInput = {
  status: StoreStatus;
  verified?: boolean;
};
