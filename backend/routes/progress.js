const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');

// @route   GET /api/progress
// @desc    Get current user progress metrics
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = new Progress({
                userId: req.user.id,
                learningStreak: 1,
                lastActiveDate: new Date(),
                completedLessonsCount: 3,
                completedProjectsCount: 1,
                overallCompletionPercentage: 35
            });
            await progress.save();
        }
        res.status(200).json(progress);
    } catch (err) {
        console.error('Get progress error:', err);
        res.status(500).json({ msg: 'Server error fetching progress metrics' });
    }
});

// @route   POST /api/progress/update
// @desc    Update progress metrics (streak, completed lessons, completed projects)
// @access  Private
router.post('/update', auth, async (req, res) => {
    try {
        const { lessonsCompleted, projectsCompleted, incStreak, overallPercentage } = req.body;
        let progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            progress = new Progress({ userId: req.user.id });
        }

        if (lessonsCompleted) progress.completedLessonsCount += Number(lessonsCompleted);
        if (projectsCompleted) progress.completedProjectsCount += Number(projectsCompleted);
        if (incStreak) progress.learningStreak += 1;
        if (overallPercentage !== undefined) progress.overallCompletionPercentage = Number(overallPercentage);

        progress.lastActiveDate = new Date();
        await progress.save();

        res.status(200).json(progress);
    } catch (err) {
        console.error('Update progress error:', err);
        res.status(500).json({ msg: 'Server error updating progress metrics' });
    }
});

module.exports = router;
