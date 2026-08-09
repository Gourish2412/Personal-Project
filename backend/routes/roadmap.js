const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const Lesson = require('../models/Lesson');
const Project = require('../models/Project');

// @route   POST api/roadmap/generate (Mock)
router.post('/generate', auth, async (req, res) => {
    try {
        // Delete existing for simplicity in MVP
        await Roadmap.deleteMany({ userId: req.user.id });

        const newRoadmap = new Roadmap({
            userId: req.user.id,
            title: 'Full-Stack Developer Path',
            description: 'A personalized path to become a full-stack developer in 6 months.',
            modules: [
                {
                    title: 'Module 1: JavaScript Mastery',
                    order: 1,
                    status: 'in-progress'
                },
                {
                    title: 'Module 2: React Ecosystem',
                    order: 2,
                    status: 'pending'
                }
            ],
            estimatedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        });

        const roadmap = await newRoadmap.save();

        // Create a mock lesson
        const lesson = new Lesson({
            roadmapId: roadmap._id,
            title: 'Asynchronous JavaScript & Promises',
            content: 'Learn how to handle async operations in JavaScript.',
            taskType: 'video',
            timeToCompleteMins: 45
        });
        await lesson.save();

        roadmap.modules[0].lessons.push(lesson._id);

        // Create a mock project
        const project = new Project({
            roadmapId: roadmap._id,
            title: 'Weather Dashboard',
            description: 'Build a weather app using React and OpenWeather API',
            milestones: [
                { title: 'Setup Repo', description: 'Initialize project' },
                { title: 'Fetch Data', description: 'Call external API' }
            ]
        });
        await project.save();

        roadmap.modules[0].projects.push(project._id);
        await roadmap.save();

        res.json(roadmap);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET api/roadmap
router.get('/', auth, async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ userId: req.user.id })
            .populate('modules.lessons')
            .populate('modules.projects');
        res.json(roadmap);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
