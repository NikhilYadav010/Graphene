require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./src/models/Project');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const project = await Project.findOne().populate('owner');
  if (project) {
    console.log('Owner is populated?', !!project.owner._id);
    console.log('project.owner.toString():', project.owner.toString());
    console.log('Type of owner.toString():', typeof project.owner.toString());
  }
  process.exit(0);
}
test();
