const express = require('express');
const router = express.Router();
const { getWeeklyEntries, upsertEntry, getDayEntries } = require('../controllers/entryController');

router.get('/weekly', getWeeklyEntries);
router.get('/daily', getDayEntries);
router.post('/', upsertEntry);

module.exports = router;