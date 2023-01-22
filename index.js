const express = require('express')
require('dotenv').config()

const app = express()
const router = require('./routes/router')
const connection = require('./database/connection')

connection.connectDB()
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use('/', router)

app.listen(process.env.PORT, () => console.log(`App is listening on port ${process.env.PORT}`))