const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // Role
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },

    // Onboarding & Profile Data
    onboardingCompleted: { type: Boolean, default: false },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    careerGoal: { type: String, default: 'Full-Stack Developer' },
    availableHours: { type: Number, default: 2 },
    preferredLanguage: { type: String, default: 'JavaScript' },
    targetCompany: { type: String, default: '' },
    deadline: { type: Date },

}, { 
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

module.exports = mongoose.model('User', userSchema);

