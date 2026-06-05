const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6'];

// GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  console.log('[PROJECT] GET / — userId:', req.user?._id);
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  })
    .populate('owner', 'name email role')
    .populate('members.user', 'name email role')
    .sort('-createdAt');

  const data = await Promise.all(
    projects.map(async (p) => {
      const [taskCount, completedCount] = await Promise.all([
        Task.countDocuments({ project: p._id }),
        Task.countDocuments({ project: p._id, status: 'done' }),
      ]);
      return {
        ...p.toObject(),
        taskCount,
        completedCount,
        progress: taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0,
      };
    })
  );
  res.json({ success: true, data });
});

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  console.log('[PROJECT] POST / — body:', { name: req.body.name, userRole: req.user?.role });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  if (req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Only admins can create projects' });

  const { name, description } = req.body;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const project = await Project.create({ name, description, owner: req.user._id, color });
  await project.populate('owner', 'name email role');
  res.status(201).json({ success: true, data: project });
});

// GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  console.log('[PROJECT] GET /:id —', req.params.id);
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email role')
    .populate('members.user', 'name email role');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isMember(req.user._id)) return res.status(403).json({ success: false, message: 'Access denied' });
  res.json({ success: true, data: project });
});

// PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  console.log('[PROJECT] PUT /:id —', req.params.id);
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isAdmin(req.user._id)) return res.status(403).json({ success: false, message: 'Only project admins can update' });

  const { name, description, status } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  await project.save();
  await project.populate('owner', 'name email role');
  await project.populate('members.user', 'name email role');
  res.json({ success: true, data: project });
});

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  console.log('[PROJECT] DELETE /:id —', req.params.id);
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (project.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Only the project owner can delete it' });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ success: true, message: 'Project deleted' });
});

// POST /api/projects/:id/members
const addMember = asyncHandler(async (req, res) => {
  console.log('[PROJECT] POST /:id/members —', req.params.id, 'email:', req.body.email);
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isAdmin(req.user._id)) return res.status(403).json({ success: false, message: 'Only project admins can add members' });

  const { email, role } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'No user found with that email' });
  if (project.owner.toString() === user._id.toString())
    return res.status(400).json({ success: false, message: 'User is already the owner' });
  if (project.members.some((m) => m.user.toString() === user._id.toString()))
    return res.status(400).json({ success: false, message: 'User is already a member' });

  project.members.push({ user: user._id, role: role || 'member' });
  await project.save();
  await project.populate('owner', 'name email role');
  await project.populate('members.user', 'name email role');
  res.json({ success: true, data: project });
});

// DELETE /api/projects/:id/members/:userId
const removeMember = asyncHandler(async (req, res) => {
  console.log('[PROJECT] DELETE /:id/members/:userId —', req.params.id, req.params.userId);
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isAdmin(req.user._id)) return res.status(403).json({ success: false, message: 'Only project admins can remove members' });
  project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
  await project.save();
  await project.populate('owner', 'name email role');
  await project.populate('members.user', 'name email role');
  res.json({ success: true, data: project });
});

// GET /api/projects/users
const getAllUsers = asyncHandler(async (req, res) => {
  console.log('[PROJECT] GET /users — userId:', req.user?._id);
  const users = await User.find({ _id: { $ne: req.user._id } }).select('name email role');
  res.json({ success: true, data: users });
});

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember, getAllUsers };
