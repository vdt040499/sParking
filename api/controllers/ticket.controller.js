const mongoose = require('mongoose');
const fetch = require('node-fetch');

const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');

exports.getticket = async (req, res, next) => {
    try {
        const tickets = await Ticket.find()
        res.json(tickets)
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
}

module.exports.createticket = async (req, res) => {
    try {
        // const user = await User.findById(req.body.userId);
        // if (!user) {
        //     res.status(400).json({
        //         message: "User does not exists"
        //     });
        // } else {

        //     const api_url = 'http://localhost:5000/detections';

        //     var plateText;

        //     try {
        //         const response = await fetch(api_url);
        //         const responseJSON = await response.json();
        //         plateText = responseJSON.response;
        //     } catch (error) {
        //         console.log(error);
        //     }

            

        //     const textPlateCheck = user.plates.indexOf(plateText);

        //     if (textPlateCheck === -1) {
        //         res.status(400).json({
        //             message: "This plate is not yours"
        //         })
        //     } else {
        //         const ticket = new Ticket({
        //             _id: new mongoose.Types.ObjectId(),
        //             createdby: req.body.userId,
        //             plateText: plateText
        //         });

        //         ticket.save();
        //         console.log(ticket);
        //         res.status(201).json({
        //             success: true,
        //             message: 'Created ticket successfully',
        //             ticket: ticket
        //         });
        //     }

        // }

        const { numplate, userId } = req.body;

        if (numplate && userId) {
            res.send('OK');
        } else {
            res.status(400).send('Numplate and userID required');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            error: err
        })
    }
}

module.exports.payTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketId);
        if (!ticket) {
            res.status(400).json({
                message: 'Ticket does not exists'
            })
        } else {
            var spawn = require('child_process').spawn;
            var process = spawn('python', ["./Plate_Recognization_SVM/read_plate.py",
                req.file.path]);

            process.stdout.on('data', function (data) {
                const textPlateForCheck = data.toString();
                var splitedTextArr = textPlateForCheck.split("\r");
                var removeTextArr = splitedTextArr.slice(0, 1);
                var plateText = removeTextArr.join("");

                if (req.params.userId !== ticket.createdby.toString()) {
                    res.status(409).json({
                        message: 'This ticket is not yours!'
                    });
                }

                if (ticket.plateText !== plateText) {
                    res.status(400).json({
                        message: 'Plate text does not match!'
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'You can take you vehicle out!'
                });
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
}