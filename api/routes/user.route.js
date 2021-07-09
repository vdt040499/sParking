const express = require('express')
const router = express.Router()

const checkAuth = require('../middleware/check-auth')
const UsersController = require('../controllers/user.controller')

router.post('/signup', UsersController.signup)

router.post('/login', UsersController.login)

router.get('/getuserswms', UsersController.getUsersWithMS)

router.post('/:userId/updateuser', UsersController.update)

router.delete('/:userId', checkAuth, UsersController.deleteUser)

router.post('/changepass/:userId', checkAuth, UsersController.changePass)

router.post('/forgotpassword', UsersController.forgotPass)

router.post('/forgotpasswordcheck', UsersController.forgotPassCheck)

router.get('/getuser/:userId', UsersController.getUser)

// Payment

router.post('/moneysource/confirm', UsersController.confirmPass)

router.get('/moneysource/:userId', UsersController.getMoneySource)

router.post('/moneysource/:userId', UsersController.createMoneySource)

router.post('/moneysource/topup/:sourceId', UsersController.topup)

router.post('/moneysource/withdraw/:sourceId', UsersController.withdraw)

router.get('/history/:userId', UsersController.getHistory)

module.exports = router;
