const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { hashPassword, comparePassword, signToken, verifyToken };