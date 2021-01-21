const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require("../models/user");

router.post('/signup', (req, res, next) => {
    User.find({
        username: req.body.username
    }).exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: "The provided username is already taken. Please provide a unique User Id."
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
                            console.log(user);
                            res.status(201).json({
                                message: 'New User Created!'
                            });
                        }
                    ).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    })
});

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