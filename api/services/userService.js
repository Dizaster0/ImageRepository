const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");

exports.user_signup = (req, res, next) => {
    User.find({username: req.body.username}).exec().then(
        user => {   
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
                            ignored => {
                                res.status(201).json({
                                    message: `Thank you for signing up ${user.username}. Proceed to 'user/login' with your new credentials to receive your authorization token.`,
                                });
                        }).catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                    }
                });
            }
        });
}

exports.user_login = (req, res, next) => {
    User.find({username: req.body.username}).exec().then(
        user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Failed to Authenticate'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
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
                        message: "Successfully Authenticated. Please include your token in your Authorization header for future requests.",
                         AuthToken: token
                    });
                }
                res.status(401).json({
                    message: 'Failed to Authenticate'
                });
            });
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
}
