const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/authMiddleware');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { totalUnits, totalAmount, billCount } = req.body;

    const prompt = `You are an energy saving expert. A household in India has uploaded ${billCount} electricity bill(s). Their total consumption is ${totalUnits} kWh and they have spent ₹${totalAmount} in total. Give them exactly 4 practical, specific tips to reduce their electricity bill. Keep each tip short (2 sentences max). Format your response as a JSON array like this: ["tip 1", "tip 2", "tip 3", "tip 4"]. Return ONLY the JSON array, nothing else.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const raw = completion.choices[0].message.content.trim();
    const tips = JSON.parse(raw);
    res.json({ tips });

  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message });
  }
});

module.exports = router;