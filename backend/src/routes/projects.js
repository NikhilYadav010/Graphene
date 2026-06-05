const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, createProject, getProject,
  updateProject, deleteProject,
  addMember, removeMember, getAllUsers,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/users', getAllUsers);
router.get('/', getProjects);
router.post('/', [body('name').trim().notEmpty().withMessage('Project name is required')], createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
