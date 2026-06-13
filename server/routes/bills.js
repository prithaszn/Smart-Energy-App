const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Bill = require('../models/Bill');
const authMiddleware = require('../middleware/authMiddleware');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Only allow PDF and images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, PNG files allowed!'));
  }
};

const upload = multer({ storage, fileFilter });

// UPLOAD A BILL
router.post('/upload', authMiddleware, upload.single('bill'), async (req, res) => {
  try {
    const { month, year, unitsConsumed, amountDue } = req.body;

    const bill = new Bill({
      user: req.user.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      month,
      year,
      unitsConsumed,
      amountDue
    });

    await bill.save();
    res.status(201).json({ message: 'Bill uploaded successfully!', bill });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET MY BILLS
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE A BILL
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user.userId });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;