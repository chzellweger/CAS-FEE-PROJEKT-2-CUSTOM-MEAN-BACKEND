import * as multer from 'multer';
import * as jimp from 'jimp';
import * as uuid from 'uuid';
import * as path from 'path';
import * as appRootDir from 'app-root-dir';

import {
  find,
  findOne,
  save,
  remove,
  update
} from '../services/product.service';
import { HttpHeaders } from '@angular/common/http';

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    console.log('multer-ing....');
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      // tslint:disable-next-line:quotemark
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

export const getProducts = async (req, res, next) => {
  console.log('getting products remotely');
  try {
    const products = await find();
    res.json({
      success: true,
      products: products
    });
    // res.write(JSON.stringify(products, null, 2));
    res.end();
  } catch (error) {
    res.status(502).json({
      error,
      success: false,
      message: 'Failed to load products'
    });
    res.end();
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await findOne(id);

    if (product) {
      res.write(JSON.stringify(product, null, 2));
      res.end();
    } else {
      throw new Error(`Found no product with id ${id} in database.`);
    }
  } catch (error) {
    res.status(404).json({
      error: {
        message: `${error.message}`,
        id: req.params.id
      }
    });
  }
};

export const log = (req, res, next) => {
  console.log('method', req.method);
  console.log('headers', req.headers);
  console.log('body', req.body);
  console.log('files', req.files);
  next();
};

export const uploadImages = multer(multerOptions).array('photos', 5);

export const resizeImages = async (req, res, next) => {
  console.log('RESIZEING');
  // check if there is no new file to resize
  if (!req.files) {
    next(); // skip to the next middleware
    return;
  }

  req.body.photos = [req.body.imageURLs] || [];

  for (const file of req.files) {
    const extension = file.mimetype.split('/')[1];
    const fileName = `${uuid.v4()}.${extension}`;
    const filePath = `${appRootDir.get()}/src/assets/uploads/${fileName}`;

    req.body.photos.push(`assets/uploads/${fileName}`);

    // // now we resize
    const photo = await jimp.read(file.buffer);

    await photo.resize(450, jimp.AUTO);

    await photo.write(filePath, () => console.log('written'));
  }
  // once we have written all the photos to our filesystem, keep going!
  next();
};

export const createProduct = (req, res, next) => {
  console.log('CREATING PRODUCT');
  req.body.categories = req.body.categories.split(',').map((el) => el.trim());

  const product = {
    ...req.body,
    categories: req.body.categories,
    imageURLs: req.body.photos
  };
  req.body.product = product;
  next();
};

export const addProduct = async (req, res, next) => {
  try {
    const dbResponse = await save(req.body.product);
    const answer = {
      success: true,
      message: `Added successfully item with id ${dbResponse.id}, ${
        dbResponse._id
      }`,
      product: dbResponse
    };
    res.json(answer);
    res.end();
  } catch (error) {
    res.status(502).json({
      error,
      success: false,
      message: `Failed to create a new product. This may be a temporary error. Try again.`,
    });
    res.end();
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const dbResponse = await update(req.body.product);
    const answer = {
      success: true,
      message: `Updated successfully item with id ${dbResponse.id}`,
      product: dbResponse
    };
    res.json(answer);
    res.end();
  } catch (error) {
    res.status(502).json({
      error,
      success: false,
      message: 'Failed to update product. This may be a temporary error. Try again.'
    });
    res.end();
  }
};

export const deleteProduct = (req, res, next) => {
  res.status(501).json({
    message: req.params.id + ' to delete. delete product not implemented.',
    success: false
  });
};

export default {
  getProducts,
  getProduct,
  uploadImages,
  resizeImages,
  createProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  log
};
