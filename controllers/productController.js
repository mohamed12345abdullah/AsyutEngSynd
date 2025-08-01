const Product = require('../models/product');
const Logger = require('../utils/logger');

// Get all products
const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: products
        });
        
    } catch (error) {
        Logger.error('Error getting products:', error);
        next(error);
    }
};

// Get single product by ID
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
            
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
        
    } catch (error) {
        Logger.error('Error getting product:', error);
        next(error);
    }
};

// Create new product
const createProduct = async (req, res, next) => {
    try {
        const { name, price, description, image } = req.body;
        
        const productData = {
            name,
            price,
            description,
            image
        };
        
        const product = await Product.create(productData);
        
        Logger.info('Product created:', { productId: product._id });
        
        res.status(201).json({
            success: true,
            message: 'تم إنشاء المنتج بنجاح',
            data: product
        });
        
    } catch (error) {
        Logger.error('Error creating product:', error);
        next(error);
    }
};

// Delete product
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        
        Logger.info('Product deleted:', { productId: product._id });
        
        res.status(200).json({
            success: true,
            message: 'تم حذف المنتج بنجاح'
        });
        
    } catch (error) {
        Logger.error('Error deleting product:', error);
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    deleteProduct
}; 