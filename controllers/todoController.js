const Todo = require('../models/task');
const Logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

// Get all todos for the authenticated user
const getAllTodos = asyncHandler(async (req, res) => {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        data: todos
    });
});

// Get single todo by ID
const getTodoById = asyncHandler(async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
            
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'المهمة غير موجودة'
            });
        }
        
        res.status(200).json({
            success: true,
            data: todo
        });
        
    } catch (error) {
        Logger.error('Error getting todo:', error);
        next(error);
    }
});

// Create new todo
const createTodo = asyncHandler(async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        
        const todoData = {
            title,
            description,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            user: req.user.id
        };
        
        const todo = await Todo.create(todoData);
        
        Logger.info('Todo created:', { todoId: todo._id, userId: req.user.id });
        
        res.status(201).json({
            success: true,
            message: 'تم إنشاء المهمة بنجاح',
            data: todo
        });
        
    } catch (error) {
        Logger.error('Error creating todo:', error);
        next(error);
    }
});

// Update todo
const updateTodo = asyncHandler(async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'المهمة غير موجودة'
            });
        }
        
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        Logger.info('Todo updated:', { todoId: todo._id, userId: req.user.id });
        
        res.status(200).json({
            success: true,
            message: 'تم تحديث المهمة بنجاح',
            data: updatedTodo
        });
        
    } catch (error) {
        Logger.error('Error updating todo:', error);
        next(error);
    }
});

// Delete todo
const deleteTodo = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID is required'
            });
        }
        const todo = await Todo.findOne({ _id: id, user: req.user.id });
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'المهمة غير موجودة'
            });
        }
        
        await Todo.findByIdAndDelete(id);
        
        Logger.info('Todo deleted:', { todoId: todo._id, userId: req.user.id });
        
        res.status(200).json({
            success: true,
            message: 'تم حذف المهمة بنجاح'
        });
        
    } catch (error) {
        Logger.error('Error deleting todo:', error);
        next(error);
    }
});

// Toggle todo completion status
const toggleTodo = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID is required'
            });
        }
        const todo = await Todo.findOne({ _id: id, user: req.user.id });
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'المهمة غير موجودة'
            });
        }
        
        todo.completed = !todo.completed;
        await todo.save();
        
        Logger.info('Todo toggled:', { todoId: todo._id, completed: todo.completed, userId: req.user.id });
        
        res.status(200).json({
            success: true,
            message: `تم ${todo.completed ? 'إكمال' : 'إلغاء إكمال'} المهمة بنجاح`,
            data: todo
        });
        
    } catch (error) {
        Logger.error('Error toggling todo:', error);
        next(error);
    }
});

// Get todos statistics
const getTodoStats = asyncHandler(async (req, res) => {
    try {
        const stats = await Todo.aggregate([
            { $match: { user: req.user.id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    pending: { $sum: { $cond: ['$completed', 0, 1] } }
                }
            }
        ]);
        
        const priorityStats = await Todo.aggregate([
            { $match: { user: req.user.id } },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } }
                }
            }
        ]);
        
        const overdueTodos = await Todo.countDocuments({
            user: req.user.id,
            completed: false,
            dueDate: { $lt: new Date() }
        });
        
        res.status(200).json({
            success: true,
            data: {
                overall: stats[0] || { total: 0, completed: 0, pending: 0 },
                byPriority: priorityStats,
                overdue: overdueTodos
            }
        });
        
    } catch (error) {
        Logger.error('Error getting todo stats:', error);
        next(error);
    }
});

module.exports = {
    getAllTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    getTodoStats
}; 