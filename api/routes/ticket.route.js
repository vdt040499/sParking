const express = require('express')
const router = express.Router()

const TicketsController = require('../controllers/ticket.controller')

router.get('/:userId/gettickets', TicketsController.getOwnTickets)

router.post('/:userId', TicketsController.createTicket)

router.post('/:userId/pay', TicketsController.payTicket)

module.exports = router;