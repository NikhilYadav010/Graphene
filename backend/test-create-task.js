require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const Project = require('./src/models/Project');
const User = require('./src/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const dummyUser = await User.findOne() || await User.create({ name: 'T', email: 't@t.com', password: '123' });
  const project = await Project.findOne() || await Project.create({ name: 'P', owner: dummyUser._id });

  try {
    const task = await Task.create({
      title: 'Test Populate',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      project: project._id,
      assignee: null,
      createdBy: dummyUser._id,
    });
    
    await task.populate('assignee', 'name email role');
    await task.populate('createdBy', 'name email');
    console.log('Populated successfully:', task.createdBy.name);
  } catch (err) {
    console.error('Error:', err);
  }

  process.exit(0);
}

test();
