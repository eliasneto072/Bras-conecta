export type AddCartItemData = {
  userId: string;
  productId: string;
  variantId: string;
  quantity: number;
};

export type UpdateCartItemData = {
  quantity: number;
};
