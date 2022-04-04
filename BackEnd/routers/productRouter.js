import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import Product from '../models/productModel.js';
import express from 'express'
import { isAuth, isAdmin } from '../utils.js';

const productRouter = express.Router();

productRouter.get(
    '/', expressAsyncHandler(async (req, res)=>{
      const name = req.query.name || '';
      const category = req.query.category || '';
      const categoryFilter = category ? { category } : {};
      const nameFilter = name ? {name : { $regex: name, $options: 'i' }} : {};
        const products = await Product.find({...nameFilter, ...categoryFilter});
        res.send(products);
    })
)

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get(
    '/seed',
    expressAsyncHandler(async (req, res) => {
        await Product.remove({});
        const createdProducts = await Product.insertMany(data.products)
        res.send({createdProducts});
    }))

    productRouter.get('/:id', expressAsyncHandler(async (req, res)=>{
        const product = await Product.findById(req.params.id)
        if (product) {
            res.send(product);
          } else {
            res.status(404).send({ message: 'Product Not Found' });
          }
    })
    
    )
    productRouter.post(
        '/',
        isAuth,
        isAdmin,
        expressAsyncHandler(async (req, res) => {
          const product = new Product({
            name: 'name ' + Date.now(),
            seller: req.user._id,
            image: '/images/i30.jpg',
            price: 599,
            category: 'Pants',
            brand: 'Denim',
            countInStock: 0,
            rating: 0,
            numReviews: 0,
            description: 'When it comes to authentic style that set itself apart nothing is cooler than this product. This product is designed with a basic fit that offers plenty of room to groove. A premium cotton fabric offers an always smooth feel and years of long lasting wear.',
          });
          const createdProduct = await product.save();
          res.send({ message: 'Product Created', product: createdProduct });
        })
      );

      productRouter.put(
        '/:id',
        isAuth,
        isAdmin,
        expressAsyncHandler(async (req, res) => {
          const productId = req.params.id;
          const product = await Product.findById(productId);
          if (product) {
            product.name = req.body.name;
            product.price = req.body.price;
            product.image = req.body.image;
            product.category = req.body.category;
            product.brand = req.body.brand;
            product.countInStock = req.body.countInStock;
            product.description = req.body.description;
            const updatedProduct = await product.save();
            res.send({ message: 'Product Updated', product: updatedProduct });
          } else {
            res.status(404).send({ message: 'Product Not Found' });
          }
        })
      );
      
      productRouter.delete(
        '/:id',
        isAuth,
        isAdmin,
        expressAsyncHandler(async (req, res) => {
          const product = await Product.findById(req.params.id);
          if (product) {
            const deleteProduct = await product.remove();
            res.send({ message: 'Product Deleted', product: deleteProduct });
          } else {
            res.status(404).send({ message: 'Product Not Found' });
          }
        })
      );
      
      productRouter.post(
        '/:id/reviews',
        isAuth,
        expressAsyncHandler(async (req, res) => {
          const productId = req.params.id;
          const product = await Product.findById(productId);
          if (product) {
            if (product.reviews.find((x) => x.name === req.user.name)) {
              return res
                .status(400)
                .send({ message: 'You already submitted a review' });
            }
            const review = {
              name: req.user.name,
              rating: Number(req.body.rating),
              comment: req.body.comment,
            };
            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
              product.reviews.reduce((a, c) => c.rating + a, 0) /
              product.reviews.length;
            const updatedProduct = await product.save();
            res.status(201).send({
              message: 'Review Created',
              review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
            });
          } else {
            res.status(404).send({ message: 'Product Not Found' });
          }
        })
      );
      
    export default productRouter;