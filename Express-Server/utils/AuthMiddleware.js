// authMiddleware.js
const jwt = require('jsonwebtoken');
const { getDBconnection } = require('../utils/Configurator');
const db = getDBconnection();

async function AuthenticationLogger(req, res, next) {
    const session_token = req.headers['session-token'];

    if (!session_token || typeof session_token !== 'string') {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    try {
        const session = jwt.verify(session_token, process.env.JWT_SESSION_TOKEN);
        if (!session.email) return res.status(401).json({ message: 'Unauthorized access' });

        const existingUser = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [session.email]);
        if (!existingUser) return res.status(401).json({ message: 'Unauthorized access' });

        if (process.env.NODE_ENV !== 'test') {
            if (existingUser.session_token !== session_token) {
                return res.status(401).json({ message: 'Unauthorized access' });
            }
        }
        req.sessionEmail = session.email; // attched for access control and verifications on DB manipulations
        next();

    } catch (error) {
        // ask for user to refresh their session if the token is expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired', refresh: true });
        }
        return res.status(401).json({ message: 'Unauthorized access' });
    }
}
module.exports = { 
    AuthenticationLogger
};
