const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { validateTask } = require('../middleware/validation');

// Stats route must come before /:id
router.get('/stats', taskController.getTaskStats);

// User-specific tasks
router.get('/user/:email', taskController.getUserTasks);

router.route('/')
    .get(taskController.getAllTasks)
    .post(validateTask, taskController.createTask);

router.route('/:id')
    .get(taskController.getTask)
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

router.patch('/:id/toggle', taskController.toggleTaskCompletion);

module.exports = router;