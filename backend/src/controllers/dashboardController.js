const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  console.log('[DASHBOARD] GET / — userId:', req.user?._id);
  const userId = req.user._id;
  const projects = await Project.find({
    $or: [{ owner: userId }, { 'members.user': userId }],
  });
  const projectIds = projects.map((p) => p._id);
  const now = new Date();

  const [totalTasks, todoCount, inProgressCount, doneCount, overdueCount, myTasks] =
    await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in_progress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: projectIds }, dueDate: { $lt: now }, status: { $ne: 'done' } }),
      Task.find({ assignee: userId, status: { $ne: 'done' } })
        .populate('project', 'name color')
        .sort('dueDate')
        .limit(5),
    ]);

  const recentTasks = await Task.find({ project: { $in: projectIds } })
    .populate('assignee', 'name')
    .populate('project', 'name color')
    .sort('-createdAt')
    .limit(6);

  res.json({
    success: true,
    data: {
      stats: { totalProjects: projects.length, totalTasks, todoCount, inProgressCount, doneCount, overdueCount },
      myTasks,
      recentTasks,
    },
  });
});

module.exports = { getDashboard };
