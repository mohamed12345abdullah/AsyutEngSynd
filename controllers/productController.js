const Product = require('../models/product');
const Logger = require('../utils/logger');

// Get all products with pagination and filtering
const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = { isActive: true };
        
        if (req.query.category) {
            filter.category = req.query.category;
        }
        
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }
        
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        
        if (req.query.seller) {
            filter.seller = req.query.seller;
        }
        
        // Build sort object
        let sort = { createdAt: -1 };
        if (req.query.sortBy) {
            const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
            sort = { [req.query.sortBy]: sortOrder };
        }
        
        const products = await Product.find(filter)
            .populate('seller', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-reviews');
            
        const total = await Product.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
        
    } catch (error) {
        Logger.error('Error getting products:', error);
        next(error);
    }
};

// Get single product by ID
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email')
            .populate('reviews.user', 'name avatar');
            
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
        // Add seller to product data
        const productData = {
            ...req.body,
            seller: req.user.id // Assuming user is authenticated
        };
        
        const product = await Product.create(productData);
        
        await product.populate('seller', 'name email');
        
        Logger.info('Product created:', { productId: product._id, seller: req.user.id });
        
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

// Update product
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        // Check if user is the seller or admin
        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتعديل هذا المنتج'
            });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('seller', 'name email');
        
        Logger.info('Product updated:', { productId: product._id, updatedBy: req.user.id });
        
        res.status(200).json({
            success: true,
            message: 'تم تحديث المنتج بنجاح',
            data: updatedProduct
        });
        
    } catch (error) {
        Logger.error('Error updating product:', error);
        next(error);
    }
};

// Delete product (soft delete)
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        // Check if user is the seller or admin
        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بحذف هذا المنتج'
            });
        }
        
        // Soft delete
        product.isActive = false;
        await product.save();
        
        Logger.info('Product deleted:', { productId: product._id, deletedBy: req.user.id });
        
        res.status(200).json({
            success: true,
            message: 'تم حذف المنتج بنجاح'
        });
        
    } catch (error) {
        Logger.error('Error deleting product:', error);
        next(error);
    }
};

// Add review to product
const addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'التقييم والتعليق مطلوبان'
            });
        }
        
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        await product.addReview(req.user.id, rating, comment);
        
        await product.populate('reviews.user', 'name avatar');
        
        Logger.info('Review added:', { productId: product._id, userId: req.user.id });
        
        res.status(200).json({
            success: true,
            message: 'تم إضافة التقييم بنجاح',
            data: product
        });
        
    } catch (error) {
        Logger.error('Error adding review:', error);
        next(error);
    }
};

// Update product stock
const updateStock = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        
        if (typeof quantity !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'كمية المخزون يجب أن تكون رقماً'
            });
        }
        
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        
        // Check if user is the seller or admin
        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث مخزون هذا المنتج'
            });
        }
        
        await product.updateStock(quantity);
        
        Logger.info('Stock updated:', { productId: product._id, quantity, updatedBy: req.user.id });
        
        res.status(200).json({
            success: true,
            message: 'تم تحديث المخزون بنجاح',
            data: product
        });
        
    } catch (error) {
        Logger.error('Error updating stock:', error);
        next(error);
    }
};

// Get products by category
const getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const products = await Product.findByCategory(category)
            .populate('seller', 'name email')
            .skip(skip)
            .limit(limit)
            .select('-reviews');
            
        const total = await Product.countDocuments({ category, isActive: true });
        
        res.status(200).json({
            success: true,
            data: {
                products,
                category,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
        
    } catch (error) {
        Logger.error('Error getting products by category:', error);
        next(error);
    }
};

// Search products
const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'كلمة البحث مطلوبة'
            });
        }
        
        const products = await Product.find(
            { $text: { $search: q }, isActive: true },
            { score: { $meta: "textScore" } }
        )
        .populate('seller', 'name email')
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .select('-reviews');
        
        const total = await Product.countDocuments({ $text: { $search: q }, isActive: true });
        
        res.status(200).json({
            success: true,
            data: {
                products,
                searchQuery: q,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
        
    } catch (error) {
        Logger.error('Error searching products:', error);
        next(error);
    }
};

// Get product statistics
const getProductStats = async (req, res, next) => {
    try {
        const stats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    totalStock: { $sum: '$stock' }
                }
            }
        ]);
        
        const categoryStats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                overall: stats[0] || {
                    totalProducts: 0,
                    avgPrice: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    totalStock: 0
                },
                byCategory: categoryStats
            }
        });
        
    } catch (error) {
        Logger.error('Error getting product stats:', error);
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
    updateStock,
    getProductsByCategory,
    searchProducts,
    getProductStats
}; 