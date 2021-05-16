const express = require('express');
const router = express.Router();
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const User = require('../models/user.model');
const UsersController = require('../controllers/user.controller');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/user');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.post('/signup', UsersController.signup);

// router.post('/:userId/uploadimage', upload.single('userImage'), UsersController.uploadImage);

router.post('/login', UsersController.login);

router.post('/:userId/updateuser', UsersController.update);

router.delete('/:userId', checkAuth, UsersController.deleteUser);

router.post('/changepass/:userId', checkAuth, UsersController.changePass);

router.post('/forgotpassword', UsersController.forgotPass);

router.post('/forgotpasswordcheck', UsersController.forgotPassCheck);

router.get('/getuser/:userId', UsersController.getUser);

router.put('/:userId/changestatus', UsersController.changeParkingStatus);

// Payment

router.get('/moneysource/:userId', UsersController.getMoneySource);

router.post('/moneysource/:userId', UsersController.createMoneySource);

router.post('/moneysource/topup/:sourceId', UsersController.topup);

router.post('/moneysource/withdraw/:sourceId', UsersController.withdraw);

router.get('/history/:userId', UsersController.getHistory);

module.exports = router;
