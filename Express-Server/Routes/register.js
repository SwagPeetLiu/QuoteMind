require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (db) => {
    router.route("/")
    .post(
        async (req, res) => {
            const { email, username, password } = req.body;
            if (!username || !password || !email) {
                return res.status(400).json({ message: 'Username and password are required' });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ message: 'Invalid email address' });
            }
            if (!validator.isLength(email, { min: process.env.Min_Email_Length, max: process.env.Max_Email_Length })) {
                return res.status(400).json({ message: 'Invalid email address' });
            }
            if (!validator.isAlphanumeric(username.replace(' ', ''))) {
                return res.status(400).json({ message: 'Username contains invalid characters' });
            }
            if (!validator.isLength(username, { min: process.env.Min_Username_Length, max: process.env.Max_Username_Length })) {
                return res.status(400).json({ 
                    message: `{Username must be between ${process.env.Min_Username_Length} and ${process.env.Max_Username_Length} characters}` 
                });
            }
            if (!validator.isLength(password, { min: process.env.Min_Password_Length, max: process.env.Max_Password_Length })) {
                return res.status(400).json({ 
                    message: `{Password must be between ${process.env.Min_Password_Length} and ${process.env.Max_Password_Length} characters}` 
                });
            }
            try {
                const user = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [email]);
                if (user) {
                    return res.status(409).json({ message: 'Email already exists' });
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                const defaultRole = "tester";
                const newUser = await db.oneOrNone('INSERT INTO public.user (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, hashedPassword,defaultRole]);
                res.status(201).json({ 
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