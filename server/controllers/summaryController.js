const db = require('../db');

// Daily summary → Pie chart data
const getDailySummary = async (req, res) => {
    try {
        const { date } = req.query;
        const result = await db.query(
            `SELECT t.task_name, t.color, t.category,
              COALESCE(te.hours_logged, 0) as hours_logged,
              t.target_hours
       FROM tasks t
       LEFT JOIN timesheet_entries te
         ON t.id = te.task_id AND te.entry_date = $2 AND te.user_id = $1
       WHERE t.user_id = $1 AND t.is_active = TRUE`,
            [req.user.id, date]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Weekly summary → Bar chart data
const getWeeklySummary = async (req, res) => {
    try {
        const { week_start } = req.query;
        const result = await db.query(
            `SELECT te.entry_date, t.task_name, t.color,
              SUM(te.hours_logged) as total_hours,
              t.target_hours
       FROM timesheet_entries te
       JOIN tasks t ON te.task_id = t.id
       WHERE te.user_id = $1
         AND te.entry_date >= $2
         AND te.entry_date < ($2::date + INTERVAL '7 days')
       GROUP BY te.entry_date, t.task_name, t.color, t.target_hours
       ORDER BY te.entry_date`,
            [req.user.id, week_start]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Bi-weekly trend → Trend line data
const getBiweeklyTrend = async (req, res) => {
    try {
        const { start_date } = req.query;
        const result = await db.query(
            `SELECT te.entry_date, t.task_name, t.color,
              SUM(te.hours_logged) as total_hours,
              t.target_hours
       FROM timesheet_entries te
       JOIN tasks t ON te.task_id = t.id
       WHERE te.user_id = $1
         AND te.entry_date >= $2
         AND te.entry_date < ($2::date + INTERVAL '14 days')
       GROUP BY te.entry_date, t.task_name, t.color, t.target_hours
       ORDER BY te.entry_date`,
            [req.user.id, start_date]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getDailySummary, getWeeklySummary, getBiweeklyTrend };