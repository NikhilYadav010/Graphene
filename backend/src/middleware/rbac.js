const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

const projectAdmin = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isAdmin(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Access denied. Project admin privileges required.' });
  }
  req.project = project;
  next();
});

const projectMember = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.isMember(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this project.' });
  }
  req.project = project;
  next();
});

module.exports = { projectAdmin, projectMember };
