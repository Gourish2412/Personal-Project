const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    modules: [{
        title: { type: String, required: true },
        order: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
        projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
    }],
    currentModuleIndex: { type: Number, default: 0 },
    estimatedCompletionDate: { type: Date },
    weakAreas: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
