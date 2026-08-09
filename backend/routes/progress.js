const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');

// @route   GET api/progress
router.get('/', auth, async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = new Progress({ userId: req.user.id });
            await progress.save();
        }
        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST api/progress/update
router.post('/update', auth, async (req, res) => {
    try {
        const { lessonsCompleted, projectsCompleted, incStreak } = req.body;
        let progress = await Progress.findOne({ userId: req.user.id });

        if (lessonsCompleted) progress.completedLessonsCount += lessonsCompleted;
        if (projectsCompleted) progress.completedProjectsCount += projectsCompleted;
        if (incStreak) progress.learningStreak += 1;

        progress.lastActiveDate = new Date();
        await progress.save();

        res.json(progress);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
