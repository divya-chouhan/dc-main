const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, addComment } = require('../controllers/taskController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getTasks);
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

router.post('/:id/comments', protect, addComment);

module.exports = router;
