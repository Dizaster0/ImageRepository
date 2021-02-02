const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

/**
 * Handles POST requests to the 'user/signup' endpoint.
 * Allows a User to register by providing a unique Username and Password.
 */
router.post('/signup', userService.user_signup);

/**
 * Handles POST request to the 'user/login' endpoint.
 * Allows a User to login with their credentials and retreive a JWT access token.
 */
router.post('/login', userService.user_login);

module.exports = router;