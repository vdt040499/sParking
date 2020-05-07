const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + '.jpg');
        //cb(null, new Date().toISOString() + file.originalname);
    }

    // destination: 'uploads/',
    // filename: function(req, file, cb) {
    //   return crypto.pseudoRandomBytes(16, function(err, raw) {
    //     if (err) {
    //       return cb(err);
    //     }
    //     return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
    //   });
    // }
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

const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');

const TicketsController = require('../controllers/ticket.controller');

router.get('/getticket', TicketsController.getticket);
router.post('/createticket', multer({ storage: storage }).single('plateImage'), TicketsController.createticket);

module.exports = router;