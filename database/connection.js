const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
exports.connectDB = () => mongoose.connect(process.env.DB_URL, () => console.log(`Successfully connected to database`))
