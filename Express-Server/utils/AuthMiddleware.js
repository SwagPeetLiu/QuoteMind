// authMiddleware.js
const jwt = require('jsonwebtoken');
const { getDBconnection } = require('../utils/Configurator');
const db = getDBconnection();

async function AuthenticationLogger(req, res, next) {
    const token = req.headers['session-token'];
    if (!token || typeof token !== 'string') {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    jwt.verify(token, process.env.JWT_token, async (err, session) => {
        if (err) return res.status(401).json({ message: 'Unauthorized access' });
        if (!session.email) return res.status(401).json({ message: 'Unauthorized access' });

        const existingUser = await db.oneOrNone('SELECT * FROM public.user WHERE email = $1', [session.email]);
        if (!existingUser) return res.status(401).json({ message: 'Unauthorized access' });
        if (existingUser.last_session !== token) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }
        
        if (isTokenExpired(token)) {
            await db.none('UPDATE public.user SET last_session = NULL WHERE email = $1', [session.email]);
            return res.status(401).json({ message: 'Unauthorized access' });
        }
        req.sessionEmail = session.email;
        next();
    });
}

function isTokenExpired(token) {
    try {
        const decoded = jwt.decode(token);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
}

module.exports = { 
    AuthenticationLogger, 
    isTokenExpired 
};
