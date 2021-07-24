const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const User = require('../models/user.model');
const MoneySource = require('../models/moneysource.model');
const Transaction = require('../models/transactionhistory');
const e = require('express');
const { validateEmail } = require('../../utils/emailValidation');

exports.signup = async (req, res) => {
  try {

    // Validation

    if (!validateEmail(req.body.email)) {
      return res.status(400).json({
        message: 'Invalid email'
      })
    }

    if (req.body.position === 'student') {
      if (req.body.ID.length !== 8) {
        return res.status(400).json({
          message: 'Invalid ID'
        })
      }
    }

    if (req.body.position === 'teacher') {
      if (req.body.ID.length !== 5) {
        return res.status(400).json({
          message: 'Invalid ID'
        })
      }
    }

    let formatedPlate = req.body.plate
    formatedPlate = formatedPlate.toLowerCase().replace(/\s+/g, "")
    
    if (formatedPlate.length < 8 || formatedPlate.length > 9 || /[a-z]/.test(formatedPlate.slice(0, 2)) || /[a-z]/.test(formatedPlate.slice(4))) {
      return res.status(400).json({
        message: 'Invalid plate'
      })
    }

    formatedPlate = formatedPlate.toUpperCase()
    formatedPlate = `${formatedPlate.slice(0, 4)} ${formatedPlate.slice(4)}`

    const user = await User.find({ email: req.body.email })
    const plate = await User.find({ plate: formatedPlate })
    const ID = await User.find({ ID: req.body.ID })

    if (user.length >= 1 || plate.length >= 1 || ID.length >= 1) {
      if (user.length >= 1) {
        return res.status(401).json({
          message: 'This email already exists',
        })
      } 
      if (plate.length >= 1) {
        return res.status(401).json({
          message: 'This plate already exists',
        })
      }
      if (ID.length >= 1) {
        return res.status(401).json({
          message: 'This ID already exists',
        })
      }
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        password: hashedPassword,
        ID: req.body.ID,
        position: req.body.position,
        email: req.body.email,
        plate: formatedPlate
      });

      user.save();

      res.status(201).json({
        message: 'Created user successfully',
        user: user,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.toString(),
    });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(401).json({
        message: 'User does not exist',
      });
    } else {
      const passwordValid = await bcrypt.compare(
        req.body.password,
        user.password
      ); //true or false

      if (!passwordValid) {
        res.status(401).json({
          message: 'Wrong password',
        });
      } else {
        const token = jwt.sign(
          {
            email: user.email,
            userid: user._id,
          },
          'sparking',
          {
            expiresIn: '7d',
          }
        );
        res.status(200).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: token,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

exports.update = async (req, res) => {
  try {

    // Validation

    if (req.body.email && !validateEmail(req.body.email)) {
      return res.status(400).json({
        message: 'Invalid email'
      })
    }

    if (req.body.position === 'student') {
      if (req.body.ID.length !== 8) {
        return res.status(400).json({
          message: 'Invalid ID'
        })
      }
    }

    if (req.body.position === 'teacher') {
      if (req.body.ID.length !== 5) {
        return res.status(400).json({
          message: 'Invalid ID'
        })
      }
    }

    const currentUser = await User.findById(req.params.userId)

    if (req.body.plate) {
      let formatedPlate = req.body.plate
      formatedPlate = formatedPlate.toLowerCase().replace(/\s+/g, "")
      
      if (formatedPlate.length < 8 || formatedPlate.length > 9 || /[a-z]/.test(formatedPlate.slice(0, 2)) || /[a-z]/.test(formatedPlate.slice(4))) {
        return res.status(400).json({
          message: 'Invalid plate'
        })
      }

      formatedPlate = formatedPlate.toUpperCase()
      formatedPlate = `${formatedPlate.slice(0, 4)} ${formatedPlate.slice(4)}`
      req.body.plate = formatedPlate

      const plate = await User.find({ plate: formatedPlate, _id: {'$ne': currentUser._id} })

      if (plate.length >= 1) {
        return res.status(401).json({
          message: 'This plate already exists'
        })
      }
    }

    const users = await User.find({ email: req.body.email, _id: {'$ne': currentUser._id} })

    const ID = await User.find({ ID: req.body.ID, _id: {'$ne': currentUser._id} })

    if (users.length >= 1) {
      return res.status(401).json({
        message: 'This email already exists'
      })
    }

    if (ID.length >= 1) {
      return res.status(401).json({
        message: 'This ID already exists'
      })
    }

    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      runValidators: true,
    });

    if (user) {
      res.status(200).json({
        message: 'OK',
        user: user,
      });
    } else {
      res.status(500).json({
        error: err,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err.toString(),
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.userId }); // { n: 1, ok: 1, deletedCount: 1 }
    console.log(deletedUser);
    if (deletedUser.deletedCount === 0) {
      res.status(400).json({
        message: 'User does not exists',
      });
    } else {
      res.status(200).json({
        message: 'Deleted User',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

exports.changePass = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (
      req.body.oldpass === '' ||
      req.body.newpass === '' ||
      req.body.reenterpass === ''
    ) {
      res.status(400).json({
        message: 'All retries must fill out',
      });
    } else if (req.body.oldpass === req.body.newpass) {
      res.status(400).json({
        message: 'New and old password are the same',
      });
    } else if (req.body.newpass !== req.body.reenterpass) {
      res.status(400).json({
        message: 'Both entries for new password must match',
      });
    } else if (await bcrypt.compare(req.body.oldpass, user.password)) {
      const hashedPassword = await bcrypt.hash(req.body.newpass, 10)
      user.password = hashedPassword
      await user.save()

      res.status(200).json({
        message: 'Change password successfully',
      });
    } else {
      res.status(401).json({
        message: 'Password does not match',
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

exports.forgotPass = async (req, res) => {
  async.waterfall([
    function (done) {
      crypto.randomBytes(3, (err, buf) => {
        if (err) throw err;
        const token = buf.toString('hex');
        done(err, token);
      });
    },

    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          return res.status(409).json({
            message: 'No account with that email address exists',
          });
        }

        user.resetToken = token;
        user.resetTokenExpires = Date.now() + 360000; //1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },

    function (token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: "sparkingadm@gmail.com",
          pass: "SparkingAdmin123456",
        },
      });

      const mailOptions = {
        from: "sparkingadm@gmail.com",
        to: user.email,
        subject: 'Renew your password',
        text: 'To reset your password with: ' + token,
      };

      transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
          console.log('Error occurs: %s', err);
          return res.status(401).json({
            error: err,
          });
        } else {
          console.log(
            'Email sent to ' + user.email + '. Please check your email please'
          );
          return res.status(200).json({
            message:
              'Email sent to ' +
              user.email +
              '. Please check your email please',
          });
        }
      });
    },
  ]);
};

exports.forgotPassCheck = async (req, res) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (user.resetToken === undefined || user.resetTokenExpires === undefined) {
      return res.status(409).json({
        message: "You have't send any verification to renew your password",
      });
    } else {
      if (Date.now > user.resetTokenExpires) {
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        user.save();
        return res.status(401).json({
          message: 'Sorry, your token expired date has been out of date',
        });
      } else {
        if (req.body.newpass === req.body.confirm) {
          if (req.body.verify === user.resetToken) {
            user.password = bcrypt.hashSync(req.body.newpass, 10);
            user.resetToken = undefined;
            user.resetTokenExpires = undefined;
            user.save();
            return res.status(200).json({
              message: 'Your password has been changed successfully',
            });
          } else {
            return res.status(402).json({
              message: 'Verify code not correct',
            });
          }
        } else {
          return res.status(403).json({
            message: 'New password and Confirm password are not the same',
          });
        }
      }
    }
  });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.userId);

  return res.status(200).json({
    user: user,
  });
};

exports.getMoneySource = async (req, res) => {
  try {
    const doc = await MoneySource.find({ user: req.params.userId });

    res.status(200).json({
      results: doc.length,
      moneySource: doc,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

exports.createMoneySource = async (req, res) => {
  try {
    const data = {
      bank: req.body.bank,
      cardnumber: req.body.cardnumber,
      validfrom: req.body.validfrom,
    };

    const api_url = 'https://sparking-banking.herokuapp.com/bank/checkbankaccount';

    const response = await fetch(api_url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

    const json = await response.json();

    if (json.message == 'OK') {
      const moneySource = new MoneySource({
        _id: new mongoose.Types.ObjectId(),
        user: req.params.userId,
        name: json.name,
        bank: json.bank,
        cardnumbersliced: json.cardnumbersliced,
      });

      moneySource.save();

      res.status(200).json({
        message: 'OK',
        moneySource: moneySource,
      });
    } else {
      res.status(409).json({
        message: json.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

exports.confirmPass = async (req, res) => {
  try {
    const { userId, password } = req.body

    const user = await User.findById(userId)


    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Wrong password! Please enter your password again"
      })
    }

    res.status(200).json({
      success: true,
      message: 'OK'
    })
  } catch (err) {
    res.status(500).json({
      error: err
    })
  }
}

exports.topup = async (req, res) => {
  try {
    const moneySource = await MoneySource.findById(req.params.sourceId);

    if (moneySource) {
      const data = {
        bank: moneySource.bank,
        cardnumbersliced: moneySource.cardnumbersliced,
        name: moneySource.name,
        amount: req.body.amount,
      };

      const api_url = 'https://sparking-banking.herokuapp.com/bank/topup';

      const response = await fetch(api_url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });

      const json = await response.json();

      if (json.message == 'OK') {
        const user = await User.findById(moneySource.user);

        if (user) {
          user.balance += parseInt(req.body.amount);

          const transaction = new Transaction({
            _id: new mongoose.Types.ObjectId(),
            user: moneySource.user,
            note: `Nạp tiền từ ${moneySource.bank}`,
            status: 'Thành công',
            amount: `+${req.body.amount}`,
          });

          user.save();

          transaction.save();

          res.status(200).json({
            message: 'OK',
            user: user,
            transaction: transaction,
          });
        }
      } else {
        res.status(409).json({
          success: false,
          message: json.message,
        });
      }
    } else {
      res.status(500).json({
        error: err,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const moneySource = await MoneySource.findById(req.params.sourceId);

    if (moneySource) {
      const data = {
        bank: moneySource.bank,
        cardnumbersliced: moneySource.cardnumbersliced,
        name: moneySource.name,
        amount: req.body.amount,
      };

      const user = await User.findById(moneySource.user);

      if (user) {
        if (user.balance < req.body.amount) {
          res.status(409).json({
            success: false,
            message:
              'There is not enough money in your account to make this transaction.',
          });
        } else {
          const api_url = 'https://sparking-banking.herokuapp.com/bank/withdraw';

          const response = await fetch(api_url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
          });

          const json = await response.json();

          if (json.message == 'OK') {
            user.balance -= parseInt(req.body.amount);

            const transaction = new Transaction({
              _id: new mongoose.Types.ObjectId(),
              user: moneySource.user,
              note: `Rút tiền về ${moneySource.bank}`,
              status: 'Thành công',
              amount: `-${req.body.amount}`,
            });

            user.save();

            transaction.save();

            res.status(200).json({
              message: 'OK',
              user: user,
              transaction: transaction,
            });
          } else {
            res.status(409).json({
              success: false,
              message: json.message,
            });
          }
        }
      } else {
        res.status(409).json({
          success: false,
          message: json.message,
        });
      }
    } else {
      res.status(500).json({
        error: err,
      });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({
      error: err,
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const doc = await Transaction.find({ user: req.params.userId });

    const sortedDoc = doc.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.status(200).json({
      results: sortedDoc.length,
      transaction: sortedDoc,
    });
  } catch (err) {
    res.status(500).json({
      error: err.toString(),
    });
  }
};

exports.getUsersWithMS = async (req, res) => {
  try {
    const users = await User.find().select(['-password', '-tickets'])
    const mosos = await MoneySource.find()
    const mappedUsers = users.map(user => {
      const newUser = { 
        _id: user.Id, 
        username: user.username, 
        ID: user.ID, 
        balance: user.balance, 
        parkingStatus: user.parkingStatus,
        position: user.position,
        email: user.email,
        plate: user.plate
      }
      mosos.forEach(moso => {
        if (moso.user.toString() == user._id.toString()) {
          newUser.moneySource = moso
        }
      })

      return newUser
    })

    res.status(200).json({
      success: true,
      users: mappedUsers
    })
  } catch (err) {
    res.status(500).json({
      error: err
    })
  }
}
