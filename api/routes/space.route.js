const express = require('express')
const router = express.Router()

const SpaceController = require('../controllers/space.controller')

router.post('/:spaceId', SpaceController.updateSpace)

module.exports = router;