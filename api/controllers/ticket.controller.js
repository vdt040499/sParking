const mongoose = require('mongoose');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');

exports.getCurNumOfTic = async (req, res, next) => {
  try {
    const today = moment().startOf('day')

    const tickets = await Ticket.find({
      createdAt: {
        $gte: today.toDate(),
        $lte: moment(today).endOf('day').toDate()
      }
    })
    res.json(tickets);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

exports.createTicket = async (req, res) => {
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
          randomCheck: randomCheck,
          user: user._id
        });

        await ticket.save()
        const currentTicket = await Ticket.findOne({ user: user._id })
        user.tickets.push(currentTicket._id)
        user.parkingStatus = true
        await user.save()
        const users = await User.find().select(['-password'])
        req.io.emit("changeList", users)
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

exports.payTicket = async (req, res) => {
  try {
    const { userId, randomCheck } = req.body;

    const user = await User.findOne({ ID: userId })

    const tickets = user.tickets

    const sortedTickets = tickets.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createAt)
    })

    const checkTicket = sortedTickets[0]

  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};
