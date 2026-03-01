const mongoose = require('mongoose')

const timeEntrySchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		branch: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Branch',
			required: false,
		},
		date: {
			type: Date,
			required: true,
			index: true,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: false,
			default: null,
		},
		hours: {
			type: Number,
			required: true,
			default: 0,
		},
		position: {
			type: String,
			required: true,
			default: 'worker',
		},
		employeeId: {
			type: String,
			required: false,
		},
		overtimeReason: {
			type: String,
			enum: ['Busy', 'Last Order', 'Company Request', 'Late Arrival', null],
			default: null,
		},
		responsiblePerson: {
			type: String,
			enum: ['Adilcan', 'Boss', ''],
			default: '',
		},
		latePerson: {
			type: String,
			default: '',
		},
	},
	{ timestamps: true }
)

// 3 oydan eski ma'lumotlarni o'chirish uchun TTL indeksi
timeEntrySchema.index({ date: 1 }, { expireAfterSeconds: 7776000 }) // 90 kun = 7776000 sekund

// Automatically calculate hours when endTime is set
timeEntrySchema.pre('save', function (next) {
	if (!this.endTime) {
		this.hours = 0
		return next()
	}
	const start = new Date(this.startTime)
	const end = new Date(this.endTime)
	const startHour = start.getHours()
	const endHour = end.getHours()
	const startMinutes = start.getMinutes()
	const endMinutes = end.getMinutes()
	let workHours
	if (
		endHour < startHour ||
		(endHour === startHour && endMinutes < startMinutes)
	) {
		workHours = 24 - startHour + endHour + (endMinutes - startMinutes) / 60
	} else {
		workHours = endHour - startHour + (endMinutes - startMinutes) / 60
	}
	this.hours = Number(workHours.toFixed(1))
	next()
})

const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema)

module.exports = TimeEntry
