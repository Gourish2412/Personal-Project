const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Onboarding Data
    onboardingCompleted: { type: Boolean, default: false },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    careerGoal: { type: String },
    availableHours: { type: Number },
    preferredLanguage: { type: String },
    targetCompany: { type: String },
    deadline: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
