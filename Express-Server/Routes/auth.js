require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// getting the configurations for validations:
const { validateEmail 
    , validatePassword
} = require('../utils/Validator');

// Route used to login user into the platform, and assigning session token accordingly
module.exports = (db) => {
    router.route("/")
        .post(async (req, res) => {
            
            // Authentication string safety checks:
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Invalid credentials: email or password' });
            }
            validations = [
                validateEmail(email),
                validatePassword(password),
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: 'Invalid credentials: email or password' });
            }

            // Validate password to return session key
            try {
                const user = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [email]);
                if (!user) {
                    return res.status(401).json({ message: 'Invalid credentials: email or password' });
                }

                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res.status(401).json({ message: 'Invalid credentials: email or password' });
                }
                
                const token = jwt.sign({ email }, process.env.JWT_token, { expiresIn: '1h' });
                res.status(200).json({ 
                    message: 'Sucessfullly Logged in', 
                    session: token, 
                    username: user.username, 
                    email: user.email, 
                    role: user.role });

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    return router;
}