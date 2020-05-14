const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storageForCreate = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, 'uploads/createticket');
  },
  filename: function(req, file, cb){
      cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  }
});

const storageForPay = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, 'uploads/payticket');
  },
  filename: function(req, file, cb){
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

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5
//   },
//   fileFilter: fileFilter
// });

const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');

const TicketsController = require('../controllers/ticket.controller');

router.get('/getticket', TicketsController.getticket);
router.post('/createticket', multer({ storage: storageForCreate }).single('plateForCreate'), TicketsController.createticket);
router.post('/payticket/:ticketId/:userId', multer({ storage: storageForPay }).single('plateForPay'), TicketsController.payTicket);

module.exports = router;