const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/:billId', authMiddleware, async (req, res) => {
  try {
    const { filePath, unitsConsumed, amountDue, month, year } = req.body;

    // Fix path for both Windows and Linux
    const cleanPath = filePath.replace(/\\/g, '/');
    const fullPath = path.join(__dirname, '..', cleanPath);

    console.log('Looking for file at:', fullPath);

    if (!fs.existsSync(fullPath)) {
      console.log('File not found at path:', fullPath);
      return res.status(404).json({ message: 'Bill file not found on server' });
    }

    const ext = path.extname(filePath).toLowerCase();
    let analysisResult;

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(fullPath);
      const pdfData = await pdfParse(dataBuffer);
      const extractedText = pdfData.text;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are an electricity bill auditor in India. Here is the raw text extracted from an electricity bill:\n\n${extractedText}\n\nThe user says: Month: ${month}, Year: ${year}, Units Consumed: ${unitsConsumed} kWh, Amount Due: ₹${amountDue}.\n\nCompare the extracted text with what the user entered. Check for: 1) Does the amount seem reasonable for the units consumed (typical Indian rate is ₹5-₹10 per unit)? 2) Any obvious errors or unusually high charges? 3) Are the units and amount consistent?\n\nRespond ONLY with a JSON object like this: {"status": "ok" or "warning", "summary": "one sentence summary", "issues": ["issue 1", "issue 2"] or [], "recommendation": "one sentence advice"}. Return ONLY the JSON, nothing else.`
        }],
        max_tokens: 400,
      });

      const raw = completion.choices[0].message.content.trim();
      const cleaned = raw.replace(/```json|```/g, '').trim();
      analysisResult = JSON.parse(cleaned);

    } else {
      const imageBuffer = fs.readFileSync(fullPath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

      const completion = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            },
            {
              type: 'text',
              text: `You are an electricity bill auditor in India. The user says this bill is for: Month: ${month}, Year: ${year}, Units Consumed: ${unitsConsumed} kWh, Amount Due: ₹${amountDue}. Look at this electricity bill image and check: 1) Does the amount seem reasonable for the units consumed (typical Indian rate is ₹5-₹10 per unit)? 2) Any obvious errors or unusually high charges? 3) Are the units and amount on the bill consistent with what the user entered? Respond ONLY with a JSON object like this: {"status": "ok" or "warning", "summary": "one sentence summary", "issues": ["issue 1", "issue 2"] or [], "recommendation": "one sentence advice"}. Return ONLY the JSON, nothing else.`
            }
          ]
        }],
        max_tokens: 400,
      });

      const raw = completion.choices[0].message.content.trim();
      const cleaned = raw.replace(/```json|```/g, '').trim();
      analysisResult = JSON.parse(cleaned);
    }

    res.json(analysisResult);

  } catch (err) {
    console.log('Analysis error:', err.message);
    res.status(500).json({ message: 'Analysis error', error: err.message });
  }
});

module.exports = router;