/**
 * Verifies if the request is authorized by checking the JWT token passed in the authorization header.
 */
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Authorization Failed. Please provide a valid JWT token in the Authorization header of your request. If you don't have a JWT token, please signup and login as a User by sending a POST request to 'user/signup' and 'user/login' respectively."
        });
    }
}