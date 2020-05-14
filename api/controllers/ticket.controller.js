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

module.exports.payTicket = async(req, res) => {
    try{
        const ticket = await Ticket.findById(req.params.ticketId);
        console.log(ticket);
        var spawn = require('child_process').spawn;
        var process = spawn('python', ["./Plate_Recognization_SVM/read_plate.py", 
                                    req.file.path]);

        process.stdout.on('data', function(data){
            const textPlateForCheck = data.toString();

            if(req.params.userId !== ticket.createdby.toString()){
                res.status(409).json({
                    message: 'This ticket is not yours!'
                });
            }

            if(ticket.plateText !== textPlateForCheck){
                res.status(400).json({
                    message: 'Plate text does not match!'
                });
            }

            res.status(200).json({
                success: true,
                message: 'You can take you vehicle out!'
            });
        });

    }catch(err){
        res.status(500).json({
            error: err
        })
    }     
}