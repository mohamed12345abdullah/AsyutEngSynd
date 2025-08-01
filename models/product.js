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
    image: {
        type: String,
        required: [true, 'الصورة مطلوبة'],
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product; 