const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/user.model');


exports.users_signup = async (req, res, next) => {
    User.find({ email: req.body.mail })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
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
                            password: hash,
                            ID: req.body.ID,
                            position: req.body.position,
                            email: req.body.email,
                            userImage: req.file.path,
                            
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    success: true,
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        })
        .catch();
}

exports.users_uploadImage = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);

        user.userImage = req.file.path;

        user.save();

        return res.status(200).json({
            message: 'Uploaded image successfully'
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

exports.users_login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Login failed'
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Login failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        email: user.email,
                        userId: user._id
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).json({
                        success: true,
                        message: 'Login successful',
                        user: {
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            userImage: user.userImage,
                            token: token
                        }
                    });
                }
                res.status(402).json({
                    message: 'Password not correct'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.users_update = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);

        const userexist = await User.find({
            email: req.body.email
        });

        if (req.body.email == "") {
            user.username = req.body.username;
            user.save();
            return res.status(200).json({
                message: 'Updates Successfully'
            });
        } else if (req.body.username == "") {
            if (userexist.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                })
            } else {
                user.email = req.body.email;
                user.save();
                return res.status(200).json({
                    message: 'Updates Successfully'
                });
            }
        } else {
            if (userexist.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                })
            } else {
                user.username = req.body.username;
                user.email = req.body.email;
                user.save();

                return res.status(200).json({
                    message: 'Updates Successfully'
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}

exports.users_delete_user = (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                error: err
            });
        });
}

exports.users_changepass = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (req.body.oldpass === req.body.newpass) {
            return res.status(409).json({
                message: 'New password and Old password are the same'
            });
        } else if (await bcrypt.compareSync(req.body.oldpass, user.password)) {
            user.password = await bcrypt.hashSync(req.body.newpass, 10);
            user.save();
            return res.status(200).json({
                message: 'Change password successfully'
            });
        } else {
            return res.status(401).json({
                error: 'Password do not match'
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}

exports.users_forgotpass = async (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(3, (err, buf) => {
                if (err) throw err;
                const token = buf.toString('hex');
                done(err, token)
            });
        },

        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    return res.status(409).json({
                        message: 'No account with that email address exists'
                    });
                }

                user.resetToken = token;
                user.resetTokenExpires = Date.now() + 360000 //1 hour

                user.save(function (err) {
                    done(err, token, user)
                });
            });
        },

        function (token, user, done) {
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASSWORD,
                }
            });

            const mailOptions = {
                from: 'sparkingsystem@gmail.com',
                to: user.email,
                subject: 'Renew your password',
                text: 'To reset your password with: ' + token
            };

            transporter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log('Error occurs: %s', err);
                    return res.status(401).json({
                        error: err
                    });
                } else {
                    console.log('Email sent to ' + user.email + '. Please check your email please');
                    return res.status(200).json({
                        message: 'Email sent to ' + user.email + '. Please check your email please'
                    });
                }
            });
        }
    ]);
}

exports.users_forgotpasscheck = async (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user.resetToken === undefined || user.resetTokenExpires === undefined) {
                return res.status(409).json({
                    message: 'You have\'t send any verification to renew your password'
                });
            } else {
                if (Date.now > user.resetTokenExpires) {
                    user.resetToken = undefined;
                    user.resetTokenExpires = undefined;
                    user.save();
                    return res.status(401).json({
                        message: 'Sorry, your token expired date has been out of date'
                    });
                } else {
                    if (req.body.newpass === req.body.confirm) {
                        if (req.body.verify === user.resetToken) {
                            user.password = bcrypt.hashSync(req.body.newpass, 10);
                            user.resetToken = undefined;
                            user.resetTokenExpires = undefined;
                            user.save();
                            return res.status(200).json({
                                message: 'Your password has been changed successfully'
                            });
                        } else {
                            return res.status(402).json({
                                message: "Verify code not correct"
                            });
                        }
                    } else {
                        return res.status(403).json({
                            message: "New password and Confirm password are not the same"
                        });
                    }

                }
            }
        });
}

exports.users_getuser = async(req, res, next) => {
    const user = await User.findById(req.params.userId);

    return res.status(200).json({
        user: user
    });
}

