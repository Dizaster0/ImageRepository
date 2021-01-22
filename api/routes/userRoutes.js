const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");

/**
 * Handles POST requests to the 'user/signup' endpoint.
 * Allows a User to register by providing a unique Username and Password.
 */
router.post('/signup', (req, res, next) => {
    User.find({
        username: req.body.username
    }).exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: "The username entered is already taken. Please enter a unique username."
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        username: req.body.username,
                        password: hash
                    });
                    user.save().then(
                        result => {
                            res.status(201).json({
                                message: `Thank you for signing up ${user.username}. Proceed to 'user/login' with your new credentials to receive your authorization token.`,
                            });
                        }
                    ).catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    })
});

/**
 * Handles POST request to the 'user/login' endpoint.
 * Allows a User to login with their credentials and retreive a JWT access token.
 */
router.post('/login', (req, res, next) => {
    User.find({
        username: req.body.username
    }).exec().then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Failed to Authenticate'
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(401).json({
                    message: 'Failed to Authenticate'
                });
            }
            if (result) {
                const token = jwt.sign({
                    username: user[0].username,
                    userId: user[0]._id
                }, process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                });
                return res.status(200).json({
                    message: "Successfully Authenticated",
                    token: token
                })
            }
            res.status(401).json({
                message: 'Failed to Authenticate'
            })
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
})

module.exports = router;