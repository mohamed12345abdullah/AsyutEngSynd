const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

// Use the existing JWT middleware
// const { auth } = require('../middlewares/jwt');

// Public routes
router.get('/', controller.getAllProducts);
router.get('/:id', controller.getProductById);
 
// Protected routes (require authentication using JWT)
router.post('/',  controller.createProduct);
router.delete('/:id',  controller.deleteProduct);


module.exports = router;
