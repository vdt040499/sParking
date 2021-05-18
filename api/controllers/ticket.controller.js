const mongoose = require('mongoose');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');

exports.getTicket = async (req, res, next) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

module.exports.createTicket = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (userId) {
      const user = await User.findOne({ ID: userId });
      if (!user) {
        res.status(400).json({
          success: false,
          message: 'User does not exists',
        });
      } else {
        const randomCheck = await bcrypt.hash(user.plate, 10)

        const ticket = new Ticket({
          _id: new mongoose.Types.ObjectId(),
          randomCheck: randomCheck,
          createdby: user._id
        });

        await ticket.save()
        user.tickets.push(ticket._id)
        await user.save()
        res.status(201).send({
          success: true,
          message: 'Created ticket successfully',
          ticket: ticket,
        });
      }
    } else {
      res.status(400).send('Numplate and userID required');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: err,
    });
  }
};

module.exports.payTicket = async (req, res) => {
  try {
    const { userId, randomCheck } = req.body;

    const user = await User.findOne({ ID: userId })

    const tickets = user.tickets

    const sortedTickets = tickets.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createAt)
    })

    const checkTicket = sortedTickets[0]

    const user = await User.findOne({ ID: userId })
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};
