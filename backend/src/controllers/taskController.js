const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/tasks/project/:projectId
const getTasksByProject = asyncHandler(async (req, res) => {
  console.log('[TASK] GET /project/:projectId —', req.params.projectId);
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isMember(req.user._id)) return res.status(403).json({ success: false, message: 'Access denied' });

  const tasks = await Task.find({ project: req.params.projectId })
    .populate('assignee', 'name email role')
    .populate('createdBy', 'name email')
    .sort('-createdAt');
  res.json({ success: true, data: tasks });
});

// POST /api/tasks/project/:projectId
const createTask = asyncHandler(async (req, res) => {
  console.log('[TASK] POST /project/:projectId —', req.params.projectId, 'body:', { title: req.body.title });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isMember(req.user._id)) return res.status(403).json({ success: false, message: 'Access denied' });

  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  const task = await Task.create({
    title, description,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    project: req.params.projectId,
    assignee: assigneeId || null,
    createdBy: req.user._id,
  });
  await task.populate('assignee', 'name email role');
  await task.populate('createdBy', 'name email');
  res.status(201).json({ success: true, data: task });
});

// GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  console.log('[TASK] GET /:id —', req.params.id);
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email role')
    .populate('createdBy', 'name email')
    .populate('project', 'name color');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  const project = await Project.findById(task.project._id || task.project);
  if (!project || !project.isMember(req.user._id)) return res.status(403).json({ success: false, message: 'Access denied' });
  res.json({ success: true, data: task });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  console.log('[TASK] PUT /:id —', req.params.id);
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user._id)) return res.status(403).json({ success: false, message: 'Access denied' });

  const isProjectAdmin = project.isAdmin(req.user._id);
  const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
  if (!isProjectAdmin && !isAssignee)
    return res.status(403).json({ success: false, message: 'Only project admins or the assignee can update this task' });

  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;
  if (priority) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (isProjectAdmin && assigneeId !== undefined) task.assignee = assigneeId || null;

  await task.save();
  await task.populate('assignee', 'name email role');
  await task.populate('createdBy', 'name email');
  res.json({ success: true, data: task });
});

// PATCH /api/tasks/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  console.log('[TASK] PATCH /:id/status —', req.params.id, 'status:', req.body.status);
  const { status } = req.body;
  if (!['todo', 'in_progress', 'done'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status value' });

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  const project = await Project.findById(task.project);
  const isProjectAdmin = project.isAdmin(req.user._id);
  const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
  if (!isProjectAdmin && !isAssignee)
    return res.status(403).json({ success: false, message: 'Only admins or the assignee can change status' });

  task.status = status;
  await task.save();
  await task.populate('assignee', 'name email role');
  res.json({ success: true, data: task });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  console.log('[TASK] DELETE /:id —', req.params.id);
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  const project = await Project.findById(task.project);
  if (!project || !project.isAdmin(req.user._id))
    return res.status(403).json({ success: false, message: 'Only project admins can delete tasks' });
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

module.exports = { getTasksByProject, createTask, getTask, updateTask, updateStatus, deleteTask };
