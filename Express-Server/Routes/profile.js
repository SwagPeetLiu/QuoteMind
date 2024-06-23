// creating the routers for the users related
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const validator = require('validator');

// managing the endpoints on updating the user profile updates
module.exports = (db) => {
    router.route("/")
        .put((req, res) => {
            const { email, username, password } = req.body;
            if (!email || !username || !password) {
                return res.status(400).json({ message: 'All informations are required' });
            }
            if (!validator.isEmail(email)) {
                return res.status(400).json({ message: 'Invalid email address' });
            }
            if (email !== req.sessionEmail) {
                return res.status(400).json({ message: 'Invalid email address' });
            }
            if (!validator.isAlphanumeric(username)) {
                return res.status(400).json({ message: 'Username contains invalid characters' });
            }
            if (!validator.isLength(username, { min: process.env.Min_Username_Length, max: process.env.Max_Username_Length })) {
                return res.status(400).json({
                    message: `Username must be between ${process.env.Min_Username_Length} and ${process.env.Max_Username_Length} characters` 
                });
            }
            if (!validator.isLength(password, { min: process.env.Min_Password_Length, max: process.env.Max_Password_Length })) {
                return res.status(400).json({ 
                    message: `Password must be between ${process.env.Min_Password_Length} and ${process.env.Max_Password_Length} characters` 
                });
            }
            try{
                const hashedPassword = bcrypt.hashSync(password, 10);
                db.none('UPDATE public.user SET username = $1, password = $2 WHERE email = $3', [username, hashedPassword, email]);
                res.status(200).json({ message: 'Profile updated successfully' });
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ message: 'Internal server error' });
            }
        })
    return router;
};
