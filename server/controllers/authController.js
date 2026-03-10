const db = require('../db');
const { hashPassword, comparePassword, signToken } = require('../utils/auth');

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'All fields required' });

        const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0)
            return res.status(400).json({ error: 'Email already registered' });

        const password_hash = await hashPassword(password);
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, password_hash]
        );

        const user = result.rows[0];
        const token = signToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0)
            return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const valid = await comparePassword(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken(user);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login };