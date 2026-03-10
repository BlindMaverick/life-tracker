const express = require('express');
const router = express.Router();
const { upsertReflection, getReflection } = require('../controllers/reflectionController');

router.get('/', getReflection);
router.post('/', upsertReflection);

module.exports = router;