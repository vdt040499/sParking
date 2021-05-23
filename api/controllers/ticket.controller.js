const mongoose = require('mongoose');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');
const Space = require('../models/space.model')

const { getCurNumOfTic } = require('../../utils/ticket')

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
          createdby: user._id
        });

        await ticket.save()
        const currentTicket = await Ticket.findOne({ createdby: user._id })
        await user.tickets.push(currentTicket._id)
        user.parkingStatus = true
        await user.save()

        // Update date on app
        const users = await User.find().select(['-password'])
        const curTickets = await getCurNumOfTic()
        const space = await Space.findOne({ name: 'UIT' })
        space.parked += 1
        space.avai -= 1
        await space.save()
        const updatedSpace = await Space.findOne({ name: 'UIT' })
        req.io.emit("changeList", users, curTickets, updatedSpace)


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
