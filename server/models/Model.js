const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  category: {
    type: String,
    required: true,
    enum: ['Architecture', 'Characters', 'Vehicles', 'Nature', 'Furniture', 'Electronics', 'Art', 'Other'],
    default: 'Other',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileFormat: {
    type: String,
    enum: ['glb', 'gltf', 'obj'],
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Model', modelSchema);
