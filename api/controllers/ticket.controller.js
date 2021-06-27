const mongoose = require('mongoose');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');
const Space = require('../models/space.model')

const { getCurNumOfTic, getAllTickets, getOwnTickets } = require('../../utils/ticket');
const { getUser } = require('../../utils/user');

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
          plate: user.plate,
          createdby: user._id
        });

        await ticket.save()
        const currentTicket = await Ticket.findOne({ createdby: user._id })
        await user.tickets.push(currentTicket._id)
        user.parkingStatus = true
        await user.save()

        // Update data on admin
        const ticketResponse = await Ticket.findOne({ randomCheck: randomCheck }).select(['randomCheck']);
        const userResponse = await User.findOne({ ID: userId }).select(['username', 'email', 'plate', 'position', 'ID']);
        const users = await User.find().select(['-password'])
        const curTickets = await getCurNumOfTic()
        const allTickets = await getAllTickets()
        const space = await Space.findOne({ name: 'UIT' })
        space.parked += 1
        space.avai -= 1
        await space.save()
        const updatedSpace = await Space.findOne({ name: 'UIT' })
        req.io.emit("changeList", users, curTickets, allTickets, updatedSpace)

        //Update data on app
        const info = await getUser(user._id)
        const tickets = await getOwnTickets(user._id)
        req.io.emit("updateApp", info, tickets)

        res.status(201).send({
          success: true,
          message: 'Created ticket successfully',
          ticket: ticketResponse,
          user: userResponse
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
    const userId = req.params.userId
    const user = await User.findOne({ ID: userId })
    const { plate } = req.body;
    const latestTicket = await Ticket.findOne({ createdby: user._id }).sort({'createdAt': -1})

    const checkPlate = await bcrypt.compare(plate, latestTicket.randomCheck)

    if (checkPlate) {
      // Update data on admin
      user.parkingStatus = false
      user.balance -= 5000
      await user.save()
      const userResponse = await User.findOne({ ID: userId }).select(['username', 'email', 'plate', 'position', 'ID']);
      const users = await User.find().select(['-password'])
      const curTickets = await getCurNumOfTic()
      const allTickets = await getAllTickets()
      const space = await Space.findOne({ name: 'UIT' })
      space.parked -= 1
      space.avai += 1
      await space.save()
      const updatedSpace = await Space.findOne({ name: 'UIT' })
      req.io.emit("changeList", users, curTickets, allTickets, updatedSpace)

      //Update data on app
      const info = await getUser(user._id)
      const tickets = await getOwnTickets(user._id)
      req.io.emit("updateApp", info, tickets)

      res.status(200).json({
        success: true,
        user: userResponse,
        ticket: latestTicket
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Please scan the QR code again'
      });
    }

  } catch (err) {
    res.status(500).json({
      error: err.toString(),
    });
  }
};

exports.getOwnTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdby: req.params.userId })

    const sortedTickets = tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.status(200).json({
      success: true,
      tickets: sortedTickets
    })
  } catch (error) {
    res.status(500).json({
      error: err.toString()
    })
  }
}
