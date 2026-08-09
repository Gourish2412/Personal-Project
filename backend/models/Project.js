const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    title: { type: String, required: true },
    description: { type: String },
    milestones: [{
        title: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
        codeSnippet: { type: String }, // User's submitted code
        aiFeedback: { type: String }
    }],
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
