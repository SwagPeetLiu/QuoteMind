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
const { AuthenticationLogger } = require('../../utils/AuthMiddleware');

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

            // Validate password to return tokens
            try {
                const user = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [email]);
                if (!user) {
                    return res.status(400).json({ message: 'Invalid credentials: email or password' });
                }
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res.status(400).json({ message: 'Invalid credentials: email or password' });
                }
                
                // Generate access_key and session_token accordingly
                const access_token = jwt.sign({ email }, process.env.JWT_ACCESS_TOKEN, { expiresIn: process.env.JWT_ACCESS_DURATION });
                const session_token = jwt.sign({ email }, process.env.JWT_SESSION_TOKEN, { expiresIn: process.env.JWT_SESSION_DURATION });

                // Enforece the single token mechanism when we are testing
                if (process.env.NODE_ENV !== 'test') {
                    await db.none('UPDATE public.user SET session_token = $1, access_token = $2 WHERE email = $3', [session_token, access_token, email]);
                }
                res.status(200).json({ 
                    message: 'Successfully Logged in', 
                    session_token: session_token,
                    access_token: access_token,
                    username: user.username, 
                    email: user.email, 
                    role: user.role 
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    
    // route used to refresh the session token:
    router.route("/refresh")
        .post( async (req, res) => {
            const { access_token } = req.body;
            const session_token = req.headers['session-token'];
            jwt.verify(session_token, process.env.JWT_SESSION_TOKEN, async (session_err, session) => {

                // verify the validity of the session-token (only allow refreshes if the current token is expired);
                if (!(session_err instanceof jwt.TokenExpiredError)) return res.status(401).json({ message: 'Unauthorized access' });

                // verify the validity of the access-token
                jwt.verify(access_token, process.env.JWT_ACCESS_TOKEN, async (access_err, access) => {
                    if (access_err) return res.status(401).json({ message: 'Unauthorized access' });
                    if (!access.email) return res.status(401).json({ message: 'Unauthorized access' });

                    // proceed to check for single session validity if environment is not testing:
                    const existingUser = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [access.email]);
                    if (!existingUser) return res.status(401).json({ message: 'Unauthorized access' });
                    if (process.env.NODE_ENV !== 'test') {
                        if (existingUser.session_token !== session_token || existingUser.access_token !== access_token) {
                            return res.status(401).json({ message: 'Unauthorized access' });
                        }
                    }

                    // generate new access_token and session_token
                    const new_access_token = jwt.sign({ email: access.email }, process.env.JWT_ACCESS_TOKEN, { expiresIn: process.env.JWT_ACCESS_DURATION });
                    const new_session_token = jwt.sign({ email: access.email }, process.env.JWT_SESSION_TOKEN, { expiresIn: process.env.JWT_SESSION_DURATION });
                    await db.none('UPDATE public.user SET session_token = $1, access_token = $2 WHERE email = $3', [new_session_token, new_access_token, access.email]);
                    return res.status(200).json({ 
                        message: 'Successfully refreshed session token', 
                        session_token: new_session_token,
                        access_token: new_access_token
                    });
                });
            });
        });

    router.use(AuthenticationLogger);

    // Route used to logg out an user:
    router.route("/logout")
        .post( async (req, res) => {
            const { email, session_token } = req.body;
            if (!email || !session_token || typeof session_token !== 'string' || 
                typeof email !== 'string' || email !== req.sessionEmail) {
                return res.status(400).json({ message: 'Unauthorized access' });
            }
            try{
                const emailValidation = validateEmail(email);
                if (!emailValidation.valid) return res.status(400).json({ message: 'Unauthorized access' });
    
                // validate the existence of an user:
                const user = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [email]);
                if (!user) {
                    return res.status(400).json({ message: 'Unauthorized access' });
                }

                // only proceed to actual token deletion if logging out in a realistic environment 
                // (i.e., prevent interference with other test cases)
                if (process.env.NODE_ENV !== 'test'){
                    if (session_token !== user.session_token) {
                        return res.status(400).json({ message: 'Unauthorized access' });
                    }
                    await db.none('UPDATE public.user SET session_token = NULL, access_token = NULL WHERE email = $1', [email]);
                }
                res.status(200).json({ message: 'Successfully logged out' });
            }
            catch(error){
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    return router;
}