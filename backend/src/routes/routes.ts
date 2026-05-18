import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.route';
import { storesRouter } from '../modules/stores/stores.routes';
import { productsRouter } from '../modules/products/products.routes';
import { categoriesRouter } from '../modules/categories/categories.routes';
import { cartRouter } from '../modules/cart/cart.routes';
import { ordersRouter } from '../modules/orders/orders.routes';

const router = Router();

router.use('/auth', authRouter());
router.use('/users', usersRouter());
router.use('/stores', storesRouter());
router.use('/stores/:storeId/products', productsRouter());
router.use('/stores/:storeId/categories', categoriesRouter());
router.use('/cart', cartRouter());
router.use('/orders', ordersRouter());

export { router };