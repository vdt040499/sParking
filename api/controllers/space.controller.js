const Space = require('../models/space.model')

exports.updateSpace = async (req, res) => {
	try {
		const space = await Space.findByIdAndUpdate(req.params.spaceId, req.body, {
			new: true,
			runValidators: true,
		})

		if (space) {
			res.status(200).json({
				message: 'OK',
				space: space,
			})
		} else {
			res.status(500).json({
				error: err,
			})
		}
	} catch (err) {
		res.status(500).json({
				error: err.toString()
		})
	}
}