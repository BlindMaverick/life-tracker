const { verifyToken } = require('../utils/auth');

module.exports = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });

    const token = header.split(' ')[1]; // "Bearer <token>"
    try {
        req.user = verifyToken(token);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};