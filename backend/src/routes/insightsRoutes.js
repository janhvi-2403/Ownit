const express = require('express');
const router = express.Router();
const axios = require('axios');
const PricePrediction = require('../models/PricePrediction');

// OpenRouter integration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const callOpenRouter = async (prompt) => {
    if (!OPENROUTER_API_KEY) {
        return { error: 'OpenRouter API Key not configured', fallbackData: 'Mock AI Response' };
    }

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI Router Error:', error.message);
        return { error: 'AI Service Unavailable', fallbackData: 'Mock AI Response' };
    }
};

router.get('/credit-score', async (req, res) => {
    // Legacy endpoint
    res.json({ score: 750, aiExplanation: "Placeholder" });
});

router.get('/citizen', async (req, res) => {
    try {
        const prompt = `You are a financial and data risk AI. Generate a concise JSON response for a citizen's profile. 
        Provide exactly three keys: "creditScore" (number 300-900), "predictions" (string, short 1-sentence market prediction regarding carbon/land assets), and "risk" (string, "Low", "Medium", or "High").
        Do not include markdown or backticks. Return strictly raw JSON.`;
        
        const aiResponse = await callOpenRouter(prompt);
        let parsed = { creditScore: 780, predictions: "Carbon credits rising 12%", risk: "Low" };
        
        try {
            if (typeof aiResponse === 'string') {
                const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(cleanJson);
            }
        } catch(e) { console.warn("AI parsing failed, using fallback.") }

        res.json(parsed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/recommendations', async (req, res) => {
    const prompt = "Provide 2 personalized recommendations for a user with $50k in carbon credits.";
    const recommendations = await callOpenRouter(prompt);
    res.json({ recommendations });
});

module.exports = router;
