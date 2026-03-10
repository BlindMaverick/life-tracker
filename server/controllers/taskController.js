const db = require('../db');

// GET all tasks for a user
const getTasks = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM tasks WHERE user_id = $1 AND is_active = TRUE ORDER BY task_code',
            [req.user.id]  
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create a new task
const createTask = async (req, res) => {
    try {
        const { user_id, task_code, task_name, category, target_hours, color } = req.body;
        const result = await db.query(
            `INSERT INTO tasks (user_id, task_code, task_name, category, target_hours, color)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id, task_code, task_name, category, target_hours, color || '#6366f1']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update a task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { task_name, category, target_hours, color } = req.body;
        const result = await db.query(
            `UPDATE tasks SET task_name=$1, category=$2, target_hours=$3, color=$4
       WHERE id=$5 RETURNING *`,
            [task_name, category, target_hours, color, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE soft delete a task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE tasks SET is_active = FALSE WHERE id = $1', [id]);
        res.json({ message: 'Task deactivated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };