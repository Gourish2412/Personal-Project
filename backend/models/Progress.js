const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learningStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    completedLessonsCount: { type: Number, default: 0 },
    completedProjectsCount: { type: Number, default: 0 },
    overallCompletionPercentage: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
