const db = require('../db');

// GET weekly grid — all entries for a given week
const getWeeklyEntries = async (req, res) => {
    try {
        const { week_start } = req.query;
        const result = await db.query(
            `SELECT te.*, t.task_code, t.task_name, t.category, t.target_hours, t.color
       FROM timesheet_entries te
       JOIN tasks t ON te.task_id = t.id
       WHERE te.user_id = $1
         AND te.entry_date >= $2
         AND te.entry_date < ($2::date + INTERVAL '7 days')
       ORDER BY te.entry_date, t.task_code`,
            [req.user.id, week_start]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST or UPDATE an entry (upsert — Oracle style, one entry per task per day)
const upsertEntry = async (req, res) => {
    try {
        const { task_id, entry_date, hours_logged, notes } = req.body;
        const result = await db.query(
            `INSERT INTO timesheet_entries (user_id, task_id, entry_date, hours_logged, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, task_id, entry_date)
       DO UPDATE SET hours_logged = $4, notes = $5
       RETURNING *`,
            [req.user.id, task_id, entry_date, hours_logged, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET single day entries (for pie chart + suggestions)
const getDayEntries = async (req, res) => {
    try {
        const { date } = req.query;
        const result = await db.query(
            `SELECT te.*, t.task_code, t.task_name, t.target_hours, t.color, t.category
       FROM timesheet_entries te
       JOIN tasks t ON te.task_id = t.id
       WHERE te.user_id = $1 AND te.entry_date = $2`,
            [req.user.id, date]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getWeeklyEntries, upsertEntry, getDayEntries };