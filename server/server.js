const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const billRoutes = require('./routes/bills');
const tipsRoutes = require('./routes/tips');
const analyzeRoutes = require('./routes/analyze');

const app = express();

app.use(cors({
  origin: [
    'https://smart-energy-app-puce.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}))
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/analyze', analyzeRoutes);

app.get('/', (req, res) => {
  res.send('Smart Energy App Backend is running! ⚡');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
// Keep-alive ping every 14 minutes
const https = require('https');
setInterval(() => {
  https.get('https://smart-energy-app-production.up.railway.app/');
}, 14 * 60 * 1000);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
