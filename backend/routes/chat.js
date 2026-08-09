const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');

let openai;
try {
    const { OpenAI } = require('openai');
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
} catch (e) {
    // OpenAI not available or key missing
}

// @route   GET api/chat/history
router.get('/history', auth, async (req, res) => {
    try {
        let conversation = await Conversation.findOne({ userId: req.user.id });
        if (!conversation) {
            conversation = new Conversation({ userId: req.user.id, messages: [] });
            await conversation.save();
        }
        res.json(conversation.messages);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   POST api/chat/message
router.post('/message', auth, async (req, res) => {
    try {
        const { message } = req.body;
        let conversation = await Conversation.findOne({ userId: req.user.id });

        if (!conversation) {
            conversation = new Conversation({ userId: req.user.id, messages: [] });
        }

        // Add user message
        conversation.messages.push({ role: 'user', content: message });

        let aiResponseContent = "";

        // If OpenAI is available, generate a real response, otherwise use intelligent mock
        if (openai) {
            // Get context
            const user = await User.findById(req.user.id);
            const roadmap = await Roadmap.findOne({ userId: req.user.id });

            const systemPrompt = `You are Lumina, an elite AI Career Mentor. 
      The user is ${user?.name || 'a student'} aiming to be a ${user?.careerGoal || 'developer'}.
      They have ${user?.availableHours || 2} hours daily.
      Be encouraging, concise. Format code in markdown. 
      If they ask to generate a roadmap, give them a structured 3-module plan.`;

            const aiMessages = [
                { role: 'system', content: systemPrompt },
                ...conversation.messages.slice(-6).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))
            ];

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: aiMessages,
                max_tokens: 500
            });
            aiResponseContent = completion.choices[0].message.content;
        } else {
            // Fallback Logic
            aiResponseContent = "I'm your AI Mentor. (Note: OpenAI API Key not configured. Please add it to .env!).\n\n### Your Next Steps:\n1. Finish JavaScript Objects.\n2. Review Asynchronous patterns.\n\n```javascript\nconsole.log('Keep up the great work!');\n```";

            if (message.toLowerCase().includes('generate roadmap') || message.toLowerCase().includes('plan')) {
                aiResponseContent = "I have generated a personalized roadmap based on your goals! Let's get started with Module 1.";
            }
        }

        conversation.messages.push({ role: 'ai', content: aiResponseContent });
        await conversation.save();

        res.json({ message: aiResponseContent, history: conversation.messages });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
