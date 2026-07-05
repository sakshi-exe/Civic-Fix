const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'under review', 'assigned', 'in progress', 'resolved'],
    },
    message: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['pothole', 'garbage', 'water leakage', 'streetlight', 'drainage', 'illegal dumping', 'traffic', 'other'],
      default: 'other',
    },
    image: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    ward: {
      type: String,
      default: '',
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'under review', 'assigned', 'in progress', 'resolved'],
      default: 'pending',
    },
    aiSummary: {
      type: String,
      default: '',
    },
    aiSeverity: {
      type: String,
      default: 'medium',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    timeline: [timelineEntrySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
