const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/user.model');


exports.signup = async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email });
        if (user.length >= 1) {
            res.status(409).json({
                message: 'User exists'
            });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: req.body.username,
                password: hashedPassword,
                ID: req.body.ID,
                position: req.body.position,
                email: req.body.email
            });
            
            user.save()

            res.status(201).json({
                message: 'Created User',
                user: user
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
}

exports.uploadImage = async (req, res) => {
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

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).json({
                message: 'User does not exist'
            });
        } else {
            const passwordValid = await bcrypt.compare(req.body.password, user.password); //true or false
            if (!passwordValid) {
                res.status(500).json({
                    message: 'Wrong password'
                });
            } else {
                const token = jwt.sign(
                    {
                        email: user.email,
                        userid: user._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "7d"
                    }
                );

                res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    userImage: user.userImage,
                    token: token
                })
            }
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
}

exports.update = async (req, res) => {
    try {
        // tìm kiếm acc bằng userId vì userId là duy nhất (unique)
        const user = await User.findById(req.params.userId);

        // tìm trong danh sách những acc có trong database, email người nhập để thay đổi có trùng với một acc nào đó không?
        const userexist = await User.find({
            email: req.body.email,

        });
        //các trường hợp có thể có
        // trường hợp email trống (empty) tức là người k thay đổi email
        if (req.body.email == "") {
            //kiểm tra tiếp username
            // nếu username trống (empty) tức là người dùng không muốn thay đổi username
            if (req.body.username == "") {
                // kiểm tra tiếp ID (mssv)
                // nếu ID trống (empty) tức là người dùng không muốn thay đổi ID
                if (req.body.ID == "") {
                    // kiểm tra tiếp position
                    // nếu position trống (empty) tức là người dùng không muốn thay đổi position
                    // lỗi: người dùng có thể thay đổi ít nhất 1 thuộc tính nào đó, không thể thay đổi rỗng
                    if (req.body.position == "") {
                        return res.status(400).json({
                            message: 'You must fill at least one field'
                        });
                    } else {
                        // ngược lại nếu position không trống
                        // lỗi: nếu thay đổi position thì phải thay đổi ID
                        return res.status(501).json({
                            message: 'If you want to change position , you must change ID more'
                        });
                    }

                } else {
                    //ngược lại nếu ID không trống
                    // kiểm tra tiếp position
                    //nếu position trống
                    //lỗi: nếu thay đổi ID thì phải thay đổi position
                    if (req.body.position == "") {
                        return res.status(501).json({
                            message: 'If you want to change ID , you must change position more'
                        });
                    } else {
                        //ngược lại nếu cả ID và position đều không trống
                        //ID và position của user tương ứng sẽ đc thay đổi như thông tin người dùng request
                        user.ID = req.body.ID;
                        user.position = req.body.position;
                        user.save();
                        // xuất thông báo thay đổi thành công
                        return res.status(200).json({
                            message: 'Updates Successfully'
                        });
                    }
                }
            } else {
                // ngược lại nếu username không trống (empty)
                //kiểm tra tiếp ID
                //nếu ID rỗng
                if (req.body.ID == "") {
                    // kiểm tra tiếp position
                    // nếu position rỗng
                    if (req.body.position == "") {
                        //username của user tương ứng sẽ đc thay đổi như thông tin người dùng request
                        user.username = req.body.username;
                        user.save();
                        // xuất thông báo thay đổi thành công
                        return res.status(200).json({
                            message: 'Updates Successfully'
                        });
                    } else {
                        // ngược lại nếu position không rỗng
                        // chỉ username đc thay đổi
                        return res.status(400).json({
                            message: 'If you want to change position , you must change ID more'
                        });
                    }
                } else {
                    // ngược lại nếu ID không rỗng
                    // kiểm tra tiếp position
                    // nếu position rỗng
                    if (req.body.position == "") {
                        return res.status(400).json({
                            message: 'If you want to change ID , you must change position more '
                        });
                    } else {
                        // ngược lại nếu position không rỗng
                        // thay đổi username, ID,position
                        user.username = req.body.username;
                        user.ID = req.body.ID;
                        user.position = req.body.position;
                        user.save();
                        return res.status(200).json({
                            message: 'Updates Successfully'
                        });
                    }
                }
            }
        } else {
            // ngược lại nếu email không rỗng
            // kiểm tra nếu email thay đổi trùng với email có trong database thì lỗi
            if (userexist.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                })
            } else {
                // ngược lại nếu email không trùng
                // kiểm tra username
                // nếu username rỗng
                if (req.body.username == "") {
                    //kiểm tra tiếp ID
                    // nếu ID rỗng
                    if (req.body.ID == "") {
                        // kiểm tra tiếp position
                        // nếu position rỗng
                        // chỉ thay đổi email
                        if (req.body.position == "") {
                            user.email = req.body.email;
                            user.save();
                            return res.status(200).json({
                                message: 'Updates Successfully'
                            });
                        } else {
                            //ngược lại nếu position không rỗng
                            // chỉ thay đổi email
                            return res.status(400).json({
                                message: 'If you want to change position, you must change ID more'
                            });
                        }

                    } else {
                        // ngược lại nếu ID không rỗng
                        //kiểm tra tiếp position
                        // nếu position rỗng
                        // chỉ thay đổi email
                        if (req.body.position == "") {
                            return res.status(400).json({
                                message: 'If you want to change ID, you must change position more'
                            });
                        } else {
                            // ngược lại nếu position không rỗng
                            // thay đổi email, ID, position
                            user.email = req.body.email;
                            user.ID = req.body.ID;
                            user.position = req.body.position;
                            user.save();
                            return res.status(200).json({
                                message: 'Updates Successfully'
                            });
                        }
                    }
                } else {
                    // ngược lại nếu username không  rỗng
                    // kiểm tra tiếp ID
                    //nesu ID rỗng
                    if (req.body.ID == "") {
                        //kiểm tra tiếp position
                        //nếu position rỗng
                        // chỉ thay đổi email, username
                        if (req.body.position == "") {
                            user.email = req.body.email;
                            user.username = req.body.username;
                            user.save();
                            return res.status(200).json({
                                message: 'Updates Successfully'
                            });
                        } else {
                            // ngược lại nếu position không rỗng
                            // chỉ thay đổi email, username
                            return res.status(400).json({
                                message: 'If you want to change position, you must change ID more'
                            });
                        }

                    } else {
                        // ngược lại nếu ID không rỗng 
                        //kiểm tra tiếp position
                        //nếu position rỗng
                        // chỉ thay đổi email, username
                        if (req.body.position == "") {
                            return res.status(400).json({
                                message: 'If you want to change ID, you must change position more'
                            });
                        } else {
                            // ngược lại nếu position không rỗng
                            // thay đổi email, username, ID, position
                            user.email = req.body.email;
                            user.username = req.body.username;
                            user.ID = req.body.ID;
                            user.position = req.body.position;
                            user.save();
                            return res.status(200).json({
                                message: 'Updates Successfully'
                            });
                        }
                    }
                }

            }

        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.deleteOne({ _id: req.params.userId }); // { n: 1, ok: 1, deletedCount: 1 }
        console.log(deletedUser);
        if (deletedUser.deletedCount === 0) {
            res.status(400).json({
                message: 'User does not exists'
            });
        } else {
            res.status(200).json({
                message: 'Deleted User'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
}

exports.changePass = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (req.body.oldpass === '' || req.body.newpass === '' || req.body.reenterpass === '') {
            res.status(400).json({
                message: 'All retries must fill out'
            });
        }
        else if (req.body.oldpass === req.body.newpass) {
            res.status(400).json({
                message: 'New and old password are the same'
            });
        } else if (req.body.newpass !== req.body.reenternewpass) {
            res.status(400).json({
                message: 'Both entries for new password must match'
            })
        } else if (await bcrypt.compare(req.body.oldpass, user.password)) {
            res.status(200).json({
                message: 'Change password successfully'
            })
        } else {
            res.status(401).json({
                message: 'Password does not match'
            })
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
}

exports.forgotPass = async (req, res) => {
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

exports.forgotPassCheck = async (req, res) => {
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

exports.getUser = async (req, res) => {
    const user = await User.findById(req.params.userId);

    return res.status(200).json({
        user: user
    });
}

