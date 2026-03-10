const express = require('express');
const router = express.Router();
const { getDailySummary, getWeeklySummary, getBiweeklyTrend } = require('../controllers/summaryController');

router.get('/daily', getDailySummary);
router.get('/weekly', getWeeklySummary);
router.get('/biweekly', getBiweeklyTrend);

module.exports = router;