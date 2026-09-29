const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const Lesson = require('../models/Lesson');
const Project = require('../models/Project');
const Progress = require('../models/Progress');
const User = require('../models/User');

// Helper to seed default roadmap if none exists
async function seedDefaultRoadmap(userId) {
    const user = await User.findById(userId);
    const stack = user?.preferredLanguage || 'Full-Stack JavaScript';

    const newRoadmap = new Roadmap({
        userId,
        title: `${stack} Mastery Path`,
        description: `Personalized curriculum designed for ${user?.careerGoal || 'Full-Stack Developer'} targeting ${user?.targetCompany || 'top tech companies'}.`,
        modules: [
            {
                title: 'Module 1: Modern JavaScript & Async Fundamentals',
                order: 1,
                status: 'in-progress'
            },
            {
                title: 'Module 2: React Component Architecture & State Management',
                order: 2,
                status: 'pending'
            },
            {
                title: 'Module 3: Full-Stack APIs & Cloud Deployment',
                order: 3,
                status: 'pending'
            }
        ],
        estimatedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        weakAreas: ['Asynchronous JS', 'Component Lifecycle']
    });

    const roadmap = await newRoadmap.save();

    // Create default lessons
    const lesson1 = await Lesson.create({
        roadmapId: roadmap._id,
        title: 'Asynchronous JavaScript & Promises',
        content: 'Learn async/await, promise chaining, and error handling for production APIs.',
        taskType: 'practice',
        timeToCompleteMins: 45,
        status: 'pending'
    });

    // Create default project with milestones
    const project1 = await Project.create({
        roadmapId: roadmap._id,
        title: 'Weather Dashboard',
        description: 'Build a production-ready weather forecast application using React, Fetch API, and responsive CSS.',
        status: 'in-progress',
        milestones: [
            {
                title: 'Step 1: Setup & Configuration',
                description: 'Initialize Vite project, clean up boilerplate, and configure environment variables.',
                status: 'completed',
                codeSnippet: '// Project initialized with Vite and React',
                aiFeedback: 'Great start! Project initialized with proper dependencies.'
            },
            {
                title: 'Step 2: Create Navbar Component',
                description: 'Build a semantic and responsive top navigation bar with search trigger.',
                status: 'in-progress',
                codeSnippet: 'const App = () => {\n  return (\n    <nav>\n      <h1>Weather API</h1>\n    </nav>\n  )\n}',
                aiFeedback: ''
            },
            {
                title: 'Step 3: Fetch Real-Time Weather API',
                description: 'Integrate asynchronous data fetching with OpenWeather API using useEffect and error handling.',
                status: 'pending',
                codeSnippet: '',
                aiFeedback: ''
            }
        ]
    });

    roadmap.modules[0].lessons.push(lesson1._id);
    roadmap.modules[0].projects.push(project1._id);
    await roadmap.save();

    return Roadmap.findById(roadmap._id)
        .populate('modules.lessons')
        .populate('modules.projects');
}

// @route   POST /api/roadmap/generate
// @desc    Generate or reset personalized roadmap
// @access  Private
router.post('/generate', auth, async (req, res) => {
    try {
        await Roadmap.deleteMany({ userId: req.user.id });
        const roadmap = await seedDefaultRoadmap(req.user.id);
        res.status(201).json(roadmap);
    } catch (err) {
        console.error('Roadmap generate error:', err);
        res.status(500).json({ msg: 'Server error generating roadmap' });
    }
});

// @route   GET /api/roadmap
// @desc    Get user roadmap (auto-seeds if missing)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let roadmap = await Roadmap.findOne({ userId: req.user.id })
            .populate('modules.lessons')
            .populate('modules.projects');

        if (!roadmap) {
            roadmap = await seedDefaultRoadmap(req.user.id);
        }

        res.status(200).json(roadmap);
    } catch (err) {
        console.error('Get roadmap error:', err);
        res.status(500).json({ msg: 'Server error fetching roadmap' });
    }
});

// @route   POST /api/roadmap/review-code
// @desc    Submit code snippet for AI review on a project milestone
// @access  Private
router.post('/review-code', auth, async (req, res) => {
    try {
        const { projectId, milestoneIndex, code } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ msg: 'Please provide code for review' });
        }

        let project;
        if (projectId) {
            project = await Project.findById(projectId);
        } else {
            // Find user's active project
            const roadmap = await Roadmap.findOne({ userId: req.user.id }).populate('modules.projects');
            if (roadmap && roadmap.modules.length > 0 && roadmap.modules[0].projects.length > 0) {
                project = roadmap.modules[0].projects[0];
            }
        }

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        const idx = typeof milestoneIndex === 'number' ? milestoneIndex : 1;

        // Feedback generation
        let feedback = "Nice implementation! You used semantic markup and clean JavaScript syntax. Ready to proceed to the next step.";
        if (code.includes('nav') || code.includes('header')) {
            feedback = "Excellent work! You used semantic HTML5 navigation elements nicely. This enhances accessibility and code readability. Your syntax is clean.";
        } else if (code.includes('fetch') || code.includes('async')) {
            feedback = "Great async handling! You structured the asynchronous request with proper error boundaries.";
        }

        if (project.milestones && project.milestones[idx]) {
            project.milestones[idx].status = 'completed';
            project.milestones[idx].codeSnippet = code;
            project.milestones[idx].aiFeedback = feedback;

            // Check if next milestone exists, set to in-progress
            if (project.milestones[idx + 1] && project.milestones[idx + 1].status === 'pending') {
                project.milestones[idx + 1].status = 'in-progress';
            }
            await project.save();
        }

        // Update User Progress
        let progress = await Progress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = new Progress({ userId: req.user.id });
        }
        progress.completedLessonsCount += 1;
        progress.lastActiveDate = new Date();
        progress.overallCompletionPercentage = Math.min(100, (progress.overallCompletionPercentage || 0) + 10);
        await progress.save();

        res.status(200).json({
            success: true,
            feedback,
            project,
            nextMilestoneIndex: idx + 1,
            progress
        });
    } catch (err) {
        console.error('Code review error:', err);
        res.status(500).json({ msg: 'Server error during code evaluation' });
    }
});

module.exports = router;
