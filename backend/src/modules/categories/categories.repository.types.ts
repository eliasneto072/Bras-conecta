export type CreateCategoryData = {
  storeId: string;
  name: string;
  slug: string;
};

export type UpdateCategoryData = {
  name?: string;
  slug?: string;
};