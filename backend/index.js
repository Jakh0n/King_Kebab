const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/auth')
const timeRoutes = require('./routes/time')

dotenv.config()

const app = express()

// Security middleware
app.use(helmet())
app.use(express.json())

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
	? [process.env.FRONTEND_URL, 'http://localhost:3000']
	: ['http://localhost:3000']

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		exposedHeaders: ['Content-Range', 'X-Content-Range'],
	})
)

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 daqiqa
	max: 100, // har bir IP dan 100 ta so'rov
})
app.use(limiter)

// MongoDB connection with retry logic
const connectWithRetry = () => {
	mongoose
		.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log('MongoDB connected successfully')
		})
		.catch(err => {
			console.error('MongoDB connection error:', err)
			console.log('Retrying in 5 seconds...')
			setTimeout(connectWithRetry, 5000)
		})
}

connectWithRetry()

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).json({ message: 'Something went wrong!' })
})

app.use('/api/auth', authRoutes)
app.use('/api/time', timeRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
