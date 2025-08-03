const express = require('express');
const router = express.Router();
const controller = require('../controllers/todoController');

// Use the existing JWT middleware
const { auth } = require('../middlewares/jwt');

// All routes require authentication
router.use(auth);

// Todo routes
router.get('/', controller.getAllTodos);
router.get('/stats', controller.getTodoStats);
router.get('/:id', controller.getTodoById);
router.post('/', controller.createTodo);
router.put('/:id', controller.updateTodo);
router.patch('/:id/toggle', controller.toggleTodo);
router.delete('/:id', controller.deleteTodo);

module.exports = router; 