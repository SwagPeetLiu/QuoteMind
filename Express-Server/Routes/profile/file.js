// creating the routers for the users related
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod': '.env.test'
});
const { getConfiguration } = require('../../utils/Configurator');
const config = getConfiguration();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { 
    validateEmail,
    validateName,
    validatePassword
} = require('../../utils/Validator');

// managing the endpoints on updating the user profile updates
module.exports = (db) => {
    router.route("/")
        .put((req, res) => {
            const { email, username, password } = req.body;
            if (!email || !username || !password || email !== req.sessionEmail) {
                return res.status(400).json({ message: 'All informations are required' });
            }
            const validations = [
                validateEmail(email),
                validateName(username),
                validatePassword(password),
            ];
            for (const validation of validations) {
                if (!validation.valid) return res.status(400).json({ message: validation.message });
            }
            try{
                // check if the user tends to update the password:
                if (password !== config.samePasswordIndicator){
                    const hashedPassword = bcrypt.hashSync(password, 10);
                    db.none('UPDATE public.user SET username = $1, password = $2 WHERE email = $3', [username, hashedPassword, req.sessionEmail]);
                    res.status(200).json({ message: 'Profile updated successfully' });
                }
                // or else only update the username accordingly
                else{
                    db.none('UPDATE public.user SET username = $1 WHERE email = $2', [username, req.sessionEmail]);
                    res.status(200).json({ message: 'Profile updated successfully' });
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            }
        })
    return router;
};
