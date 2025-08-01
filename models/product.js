const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'اسم المنتج مطلوب'],
        minlength: [2, 'اسم المنتج يجب أن يكون على الأقل حرفين'],
        maxlength: [100, 'اسم المنتج لا يمكن أن يتجاوز 100 حرف'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'وصف المنتج مطلوب'],
        minlength: [10, 'وصف المنتج يجب أن يكون على الأقل 10 أحرف'],
        maxlength: [1000, 'وصف المنتج لا يمكن أن يتجاوز 1000 حرف'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'سعر المنتج مطلوب'],
        min: [0, 'السعر لا يمكن أن يكون سالب'],
        max: [1000000, 'السعر لا يمكن أن يتجاوز 1,000,000']
    },
    category: {
        type: String,
        required: [true, 'فئة المنتج مطلوبة'],
        enum: {
            values: ['إلكترونيات', 'ملابس', 'أثاث', 'كتب', 'ألعاب', 'طعام', 'صحة', 'أخرى'],
            message: 'فئة المنتج غير صحيحة'
        }
    },
    stock: {
        type: Number,
        required: [true, 'كمية المخزون مطلوبة'],
        min: [0, 'المخزون لا يمكن أن يكون سالب'],
        default: 0
    },
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v) || /^\/uploads\/.+/.test(v);
            },
            message: 'رابط الصورة غير صحيح'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'الوسم لا يمكن أن يتجاوز 20 حرف']
    }],
    rating: {
        type: Number,
        min: [0, 'التقييم لا يمكن أن يكون أقل من 0'],
        max: [5, 'التقييم لا يمكن أن يتجاوز 5'],
        default: 0
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for average rating
productSchema.virtual('averageRating').get(function() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for review count
productSchema.virtual('reviewCount').get(function() {
    return this.reviews.length;
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ seller: 1 });

// Pre-save middleware to update average rating
productSchema.pre('save', function(next) {
    if (this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
    }
    next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true });
};

// Static method to find products in price range
productSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
    return this.find({ 
        price: { $gte: minPrice, $lte: maxPrice },
        isActive: true 
    });
};

// Instance method to add review
productSchema.methods.addReview = function(userId, rating, comment) {
    // Check if user already reviewed
    const existingReview = this.reviews.find(review => 
        review.user.toString() === userId.toString()
    );
    
    if (existingReview) {
        throw new Error('لقد قمت بتقييم هذا المنتج من قبل');
    }
    
    this.reviews.push({ user: userId, rating, comment });
    return this.save();
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity) {
    if (this.stock + quantity < 0) {
        throw new Error('المخزون غير كافي');
    }
    this.stock += quantity;
    return this.save();
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product; 