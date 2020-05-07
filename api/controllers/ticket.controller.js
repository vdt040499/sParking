const mongoose = require('mongoose');

const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');

exports.getticket = async(req, res, next) => {
    try {
        const tickets = await Ticket.find()
        res.json(tickets)
      } catch (err) {
        res.status(500).json({
          error: err
        });
      }
}

exports.createticket = (req, res, next) => {
    var spawn = require('child_process').spawn;
    var process = spawn('python', ["./Plate_Recognization_SVM/read_plate.py", 
                                req.file.path]);

    process.stdout.on('data', function(data){
        const ticket = new Ticket({
            _id: new mongoose.Types.ObjectId(),
            plateImage: req.file.path,
            createdby: req.body.userId,
            plateText: data.toString()
        });
    
        ticket.save().then(result => {
            console.log(result);
            res.status(201).json({
                success: true,
                message: 'Created ticket successfully',
                ticket: result
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
    });    
}