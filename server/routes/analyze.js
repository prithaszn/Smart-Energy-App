const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/authMiddleware');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/:billId', authMiddleware, async (req, res) => {
  try {
    const { unitsConsumed, amountDue, month, year } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are an electricity bill auditor in India. The user has entered the following bill details: Month: ${month}, Year: ${year}, Units Consumed: ${unitsConsumed} kWh, Amount Due: ₹${amountDue}.\n\nCheck for: 1) Is the amount reasonable for the units consumed? (typical Indian rate is ₹5-₹10 per unit) 2) Any unusually high charges? 3) Are the units and amount consistent?\n\nRespond ONLY with a JSON object: {"status": "ok" or "warning", "summary": "one sentence summary", "issues": ["issue 1"] or [], "recommendation": "one sentence advice"}. Return ONLY the JSON, nothing else.`
      }],
      max_tokens: 400,
    });

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const analysisResult = JSON.parse(cleaned);

    res.json(analysisResult);

  } catch (err) {
    console.log('Analysis error:', err.message);
    res.status(500).json({ message: 'Analysis error', error: err.message });
  }
});

module.exports = router;