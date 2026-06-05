const express = require('express');
const { body } = require('express-validator');
const {
  getTasksByProject, createTask,
  getTask, updateTask, updateStatus, deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/project/:projectId', getTasksByProject);
router.post('/project/:projectId', [body('title').trim().notEmpty().withMessage('Task title is required')], createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteTask);

module.exports = router;
