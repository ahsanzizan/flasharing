const multer = require('multer')
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const File = require('./models/File')
require('dotenv').config()

const app = express()
const upload = multer({ dest: 'uploads'})
mongoose.connect(process.env.DB_URL)

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')

// PORT/
app.get('/', (req, res) => {
    res.render('index')
})

// PORT/upload
app.post('/upload', upload.single('file'), async (req, res) => {
    const data = {
        path: req.file.path,
        originalName: req.file.originalname
    }

    if (req.body.password != null && req.body.password != ""){
        data.password = await bcrypt.hash(req.body.password, 10)
    }

    const file = await File.create(data)
    res.render('index', { link: `${req.headers.origin}/file/${file.id}`})
})

// To download the file PORT/file/:id
app.get('/file/:id', async (req, res) => {
    const file = await File.findById(req.params.id)

    if (file.password != null) {
        if (req.body.password == null) {
            res.render('password')
            return
        }

        if (!(await bcrypt.compare(req.body.password, file.password))) {
            res.render('password', { error: true})
            return
        }
    }

    file.downloadCounts++
    await file.save()
    res.download(file.path, file.originalName)
})

async function download(req, res) {
    const file = await File.findById(req.params.id)

    if (file.password != null) {
        if (req.body.password == null) {
            res.render('password')
            return
        }

        if (!(await bcrypt.compare(req.body.password, file.password))) {
            res.render('password', { error: true})
            return
        }
    }

    file.downloadCounts++
    await file.save()
    res.download(file.path, file.originalName)
}

app.route('/file/:id').get(download).post(download)

app.listen(process.env.PORT)
