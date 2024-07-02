require('dotenv').config({
    path: process.env.NODE_ENV === 'development' ? '.env.test' : '.env.prod'
});
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// getting the configurations for validations:
const { validateEmail 
    , validatePassword
} = require('../../utils/Validator');

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
                await db.none('UPDATE public.user SET last_session = $1 WHERE email = $2', [token, email]);
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
    
    // Route used to logg out an user:
    router.route("/logout")
        .post( async (req, res) => {
            const { email, token } = req.body;
            if (!email || !token || typeof token !== 'string' || typeof email !== 'string') {
                return res.status(401).json({ message: 'Unauthorized access' });
            }
            try{
                const emailValidation = validateEmail(email);
                if (!emailValidation.valid) return res.status(401).json({ message: 'Unauthorized access' });
                
                // validate the existence of an user:
                const user = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [email]);
                if (!user) {
                    return res.status(401).json({ message: 'Unauthorized access' });
                }
                if (token !== user.last_session) {
                    return res.status(401).json({ message: 'Unauthorized access' });
                }

                // only proceed to actual token deletion if logging out in a realistic environment 
                // (i.e., prevent interference with other test cases)
                if (process.env.NODE_ENV !== 'test'){
                    await db.none('UPDATE public.user SET last_session = NULL WHERE email = $1', [email]);
                }
                res.status(200).json({ message: 'Successfully logged out' });
            }
            catch(error){
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        })
    return router;
}