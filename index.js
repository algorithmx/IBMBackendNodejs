const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const { JWT_SECRET } = require('./router/secret.js');

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

// TODO improve this!
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the session has a user ID
    if (req.session.userId) {
        // If there's a user ID in the session, proceed to the next middleware
        // This is for session-based authentication
        next();
    } else {
        // If no user ID, check for JWT in the Authorization header
        const token = req.headers['authorization'];
        if (token) {
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(901).json({ message: `Failed to authenticate token, due to ${err}` });
                } else {
                    req.session.userId = decoded.userId;
                    next();
                }
            });
        } else {
            // No token provided, return an error
            return res.status(703).json({ message: 'No token provided.' });
        }
    }
});


const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;