const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'عنوان المهمة مطلوب'],
        minlength: [2, 'العنوان يجب أن يكون على الأقل حرفين'],
        maxlength: [200, 'العنوان لا يمكن أن يتجاوز 200 حرف'],
        trim: true
    },
    description: {
        type: String,
        maxlength: [1000, 'الوصف لا يمكن أن يتجاوز 1000 حرف'],
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: {
            values: ['منخفض', 'متوسط', 'عالي'],
            message: 'الأولوية يجب أن تكون: منخفض، متوسط، أو عالي'
        },
        default: 'متوسط'
    },
    dueDate: {
        type: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better performance
todoSchema.index({ user: 1, completed: 1 });
todoSchema.index({ dueDate: 1 });
todoSchema.index({ priority: 1 });

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
