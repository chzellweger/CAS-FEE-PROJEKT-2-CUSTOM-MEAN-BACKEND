import * as express from 'express';
import { Router } from 'express';

import * as jwt from 'express-jwt';
import * as Guard from 'express-jwt-permissions';

import api from '../routes/api.routes';

import { adminAuth } from '../controller/admin-auth.controller';
import {
  registerUser,
  loginUser,
  getProfile,
  updateUser,
  deleteUser
} from '../controller/users.controller';
import {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
  getAllOrders
} from '../controller/orders.controller';
import {
  getProducts,
  getProduct,
  uploadImages,
  resizeImages,
  createProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  log
} from '../controller/products.controller';

const router = Router();

const auth = jwt({
  secret: process.env.SECRET,
  user: 'payload'
});

const guard = Guard();

// api route, just send a sign of life
router.use('/api', api);

/**
 * ADMIN ROUTES
 */

// server-side of angular route-guard
router.get('/api/admin-auth', auth, guard.check(process.env.ADMIN), adminAuth);

/**
 * USER ROUTES
 */
router.get('/api/user', auth, getProfile);

router.post('/api/user', registerUser);
router.post('/api/user/login', loginUser);

router.put('/api/user/:id', auth, updateUser);

router.delete('/api/user/:id', auth, guard.check(process.env.ADMIN), deleteUser);

/**
 * ORDER ROUTES
 */
router.get('/api/orders', auth, getOrders);
router.get('/api/orders/all', auth, guard.check(process.env.ADMIN), getAllOrders);
router.get('/api/orders/:id', auth, getOrder);

router.post(
  '/api/orders',
  // check for auth token, skip auth if none present:
  auth.unless({
    custom: (req) => {
      const headerToCheck = req.headers.authorization;
      if (headerToCheck) {
        // token present, run auth-middleware
        return false;
      } else {
        // no token, skip auth-middleware
        return true;
      }
    }
  }),
  createOrder
);

router.delete('/api/orders/:id', auth, guard.check(process.env.ADMIN), deleteOrder);

/**
 * PRODUCT ROUTES
 */
router.get('/api/products', getProducts);
router.get('/api/products/:id', getProduct);

router.post(
  '/api/products',
  auth,
  guard.check(process.env.ADMIN),
  uploadImages,
  resizeImages,
  createProduct,
  addProduct
);

router.put(
  '/api/products/:id',
  auth,
  guard.check(process.env.ADMIN),
  uploadImages,
  log,
  resizeImages,
  createProduct,
  updateProduct
);

router.delete('/api/products/:id', auth, guard.check(process.env.ADMIN), deleteProduct);

export default router;
