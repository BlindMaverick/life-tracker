const db = require('../db');

// Auto-generate suggestions based on missed targets
const generateSuggestions = (tasks, entries) => {
    const suggestions = [];

    tasks.forEach(task => {
        const entry = entries.find(e => e.task_id === task.id);
        const logged = entry ? parseFloat(entry.hours_logged) : 0;
        const target = parseFloat(task.target_hours);
        const missed = target - logged;

        if (missed > 0.25) { // only flag if missed more than 15 mins
            suggestions.push({
                task_code: task.task_code,
                task_name: task.task_name,
                missed_hours: missed.toFixed(2),
                message: `You missed ${missed.toFixed(1)} hr(s) of "${task.task_name}" — prioritize this tomorrow.`
            });
        }
    });

    return suggestions.sort((a, b) => b.missed_hours - a.missed_hours); // worst first
};

// POST save or update a reflection
const upsertReflection = async (req, res) => {
    try {
        const { user_id, reflection_date, what_went_well, what_was_missed, plan_for_tomorrow } = req.body;

        // Fetch today's tasks and entries to generate suggestions
        const tasksResult = await db.query(
            'SELECT * FROM tasks WHERE user_id = $1 AND is_active = TRUE', [user_id]
        );
        const entriesResult = await db.query(
            'SELECT * FROM timesheet_entries WHERE user_id = $1 AND entry_date = $2',
            [user_id, reflection_date]
        );

        const suggestions = generateSuggestions(tasksResult.rows, entriesResult.rows);

        const result = await db.query(
            `INSERT INTO daily_reflections
         (user_id, reflection_date, what_went_well, what_was_missed, plan_for_tomorrow, auto_suggestions)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, reflection_date)
       DO UPDATE SET what_went_well=$3, what_was_missed=$4, plan_for_tomorrow=$5, auto_suggestions=$6
       RETURNING *`,
            [user_id, reflection_date, what_went_well, what_was_missed, plan_for_tomorrow, JSON.stringify(suggestions)]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET reflection for a date
const getReflection = async (req, res) => {
    try {
        const { user_id, date } = req.query;
        const result = await db.query(
            'SELECT * FROM daily_reflections WHERE user_id = $1 AND reflection_date = $2',
            [user_id, date]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { upsertReflection, getReflection };