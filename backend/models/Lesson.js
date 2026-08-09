const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    title: { type: String, required: true },
    content: { type: String },
    taskType: { type: String, enum: ['reading', 'video', 'practice', 'quiz'], default: 'reading' },
    practiceQuestions: [{
        question: { type: String },
        hint: { type: String }
    }],
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    timeToCompleteMins: { type: Number, default: 30 }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
