const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        minlength: [3, 'name must be at least 3 characters long'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true,'email already exists'],
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email is invalid']
    },
    password: {
        type: String,
        minlength: [8, 'password must be at least 8 characters long'],
        required: [true, 'password is required']
    },
    googleId: {
        type: String,
        unique: [true,'googleId already exists'],
        sparse: true
    },
    avatar: {
        type: String
    },


}, {
    timestamps: true
});

// حذف الـ index القديم عند تشغيل التطبيق
userSchema.pre('save', async function() {
    try {
        await this.collection.dropIndex('email_1');
    } catch (error) {
        // تجاهل الخطأ إذا لم يكن الـ index موجوداً
    }
});



// compare password 
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};




const User = mongoose.model("User", userSchema);

module.exports = User;

