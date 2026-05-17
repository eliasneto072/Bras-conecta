import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.route';
import { storesRouter } from '../modules/stores/stores.routes';
import { productsRouter } from '../modules/products/products.routes';
import { categoriesRouter } from '../modules/categories/categories.routes';

const router = Router();

router.use('/auth', authRouter());
router.use('/users', usersRouter());
router.use('/stores', storesRouter());
router.use('/stores/:storeId/products', productsRouter());
router.use('/stores/:storeId/categories', categoriesRouter());

export { router };