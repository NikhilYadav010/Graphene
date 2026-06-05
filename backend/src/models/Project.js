const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    color: { type: String, default: '#7c3aed' },
  },
  { timestamps: true }
);

projectSchema.methods.isAdmin = function (userId) {
  const ownerId = this.owner && this.owner._id ? this.owner._id.toString() : this.owner.toString();
  if (ownerId === userId.toString()) return true;
  const member = this.members.find((m) => {
    const mUserId = m.user && m.user._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
    return mUserId === userId.toString();
  });
  return member && member.role === 'admin';
};

projectSchema.methods.isMember = function (userId) {
  const ownerId = this.owner && this.owner._id ? this.owner._id.toString() : this.owner.toString();
  if (ownerId === userId.toString()) return true;
  return this.members.some((m) => {
    const mUserId = m.user && m.user._id ? m.user._id.toString() : (m.user ? m.user.toString() : null);
    return mUserId === userId.toString();
  });
};

module.exports = mongoose.model('Project', projectSchema);
