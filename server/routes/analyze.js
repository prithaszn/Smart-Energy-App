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

    if (!filePath) {
      return res.status(400).json({ message: 'No file path provided' });
    }

    const cleanPath = filePath.replace(/\\/g, '/').replace('/uploaded/', '/uploads/');
    const fullPath = path.join(__dirname, '..', cleanPath);

    console.log('Looking for file at:', fullPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        status: 'warning',
        summary: 'Bill file not found on server.',
        issues: [],
        recommendation: 'Try re-uploading your bill.'
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    let analysisResult;

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(fullPath);
      const pdfData = await pdfParse(dataBuffer);
      const extractedText = pdfData.text;

      if (!extractedText || extractedText.trim().length < 30) {
        return res.json({
          status: 'invalid',
          summary: 'This does not appear to be a valid electricity bill.',
          issues: [],
          recommendation: 'Please upload a proper electricity bill PDF.'
        });
      }

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are a strict electricity bill auditor for India.

Here is raw text extracted from an uploaded document:
"""
${extractedText.slice(0, 3000)}
"""

The user manually entered these values:
- Month: ${month}, Year: ${year}
- Units Consumed: ${unitsConsumed} kWh
- Amount Due: ₹${amountDue}

Do the following:
1. First check if this is actually an electricity bill. Look for keywords like: units, kWh, meter number, consumer number, electricity board, WBSEDCL, BESCOM, MSEDCL, TNEB, tariff, sanctioned load. If it is NOT an electricity bill, return status "invalid".
2. If it IS a bill, extract the ACTUAL units and amount printed in the document.
3. Compare the document values with what the user entered — flag specific mismatches with actual numbers.
4. Calculate per-unit rate = amount ÷ units. Indian residential rates are ₹3–₹12/unit. Flag if outside this range.
5. Mention the electricity board name if visible.

Return ONLY this JSON, no markdown, no extra text:
{"status": "ok" or "warning" or "invalid", "summary": "specific sentence with actual values from the document", "issues": ["specific issue with actual numbers"] or [], "recommendation": "specific actionable advice"}

If invalid: {"status": "invalid", "summary": "This does not appear to be an electricity bill.", "issues": [], "recommendation": "Please upload a valid electricity bill."}

Never give generic responses. Always mention actual rupee amounts and unit numbers you found in the document.`
        }],
        max_tokens: 500,
      });

      const raw = completion.choices[0].message.content.trim();
      const cleaned = raw.replace(/```json|```/g, '').trim();
      analysisResult = JSON.parse(cleaned);

    } else {
      // Image (jpg, jpeg, png)
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
              text: `You are a strict electricity bill auditor for India.

The user manually entered:
- Month: ${month}, Year: ${year}
- Units Consumed: ${unitsConsumed} kWh  
- Amount Due: ₹${amountDue}

Look carefully at this image and do the following:

STEP 1 — Is this an electricity bill?
Look for: meter number, consumer number, units/kWh, electricity board name (WBSEDCL, BESCOM, MSEDCL, TNEB, CESC, TPDDL etc), billing period, tariff details.
If this is NOT an electricity bill (it's a photo of food, a person, a random object, a non-electricity receipt, a blank image, etc.) — immediately return status "invalid".

STEP 2 — If it IS a bill, read the ACTUAL printed values:
- Actual units consumed shown on bill
- Actual amount due shown on bill  
- Billing period / month shown
- Electricity board / company name
- Per-unit rate (amount ÷ units) — flag if outside ₹3–₹12

STEP 3 — Compare with user-entered values and flag specific mismatches.

Return ONLY this JSON, no extra text:
{"status": "ok" or "warning" or "invalid", "summary": "specific sentence mentioning actual values read from the bill", "issues": ["specific issue with actual numbers from bill"] or [], "recommendation": "specific advice based on findings"}

If NOT an electricity bill: {"status": "invalid", "summary": "This image does not appear to be an electricity bill.", "issues": [], "recommendation": "Please upload a clear photo or scan of your electricity bill."}

Be very specific — quote actual numbers visible on the bill. Never give generic responses.`
            }
          ]
        }],
        max_tokens: 500,
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