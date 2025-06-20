const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ['info', 'warning', 'success'],
			default: 'info',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Announcement', announcementSchema)
