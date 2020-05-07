const express = require('express');
const router = express.Router();
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const User = require('../models/user.model');
const UsersController = require('../controllers/user.controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
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
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post('/signup', multer({
    storage: storage
}).single('userImage'), UsersController.users_signup);

router.post('/:userId/uploadimage', upload.single('userImage'), UsersController.users_uploadImage);

router.post('/login', UsersController.users_login);

router.post('/:userId/updateuser', checkAuth, UsersController.users_update);

router.delete('/:userId', checkAuth, UsersController.users_delete_user);

router.post('/changepass', checkAuth, UsersController.users_changepass);

router.post('/forgotpassword', UsersController.users_forgotpass);

router.post('/forgotpasswordcheck', UsersController.users_forgotpasscheck);

router.get('/getuser/:userId', UsersController.users_getuser);



module.exports = router;