const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Public routes (no token needed)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (token required)
app.use('/api/tasks', authMiddleware, require('./routes/tasks'));
app.use('/api/entries', authMiddleware, require('./routes/entries'));
app.use('/api/reflections', authMiddleware, require('./routes/reflections'));
app.use('/api/summary', authMiddleware, require('./routes/summary'));

// Health check
app.get('/', (req, res) => res.json({ message: '🟢 Life Tracker API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));