require('dotenv').config({
    path: process.env.NODE_ENV === 'development' ? '.env.test' : '.env.prod'
});
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { 
    validateEmail,
    validateUserName,
    validatePassword,
    validateToken
} = require('../../utils/Validator');

module.exports = (db) => {
    router.route("/")
    .post(
        async (req, res) => {
            // validate register information
            const { email, username, password , registerToken} = req.body;
            if (!username || !password || !email || !registerToken ||
                typeof username !== 'string' || typeof password !== 'string' || typeof email !== 'string'
                || typeof registerToken !== 'string'
            ) {
                return res.status(400).json({ message: 'Complete Registeration form is required' });
            }

            const validations = [
                validateEmail(email),
                validateUserName(username),
                validatePassword(password),
                validateToken(registerToken)
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }

            // validate register token
            if (registerToken !== process.env.REGISTER_TOKEN) {
                return res.status(401).json({ message: 'Invalid Token Provided' });
            }

            // create an user if no previous email was registered here:
            try {
                const user = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [email]);
                if (user) {
                    return res.status(409).json({ message: 'Email already exists' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                const defaultRole = "user";
                const newUser = await db.oneOrNone('INSERT INTO public.user (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, hashedPassword, defaultRole]);
                res.status(200).json({ 
                    message: 'User created successfully',
                    user: {
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role
                    }
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    )
    return router;
}