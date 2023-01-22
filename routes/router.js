const multer = require('multer')
const express = require('express')
const bcrypt = require('bcrypt')
const File = require('../models/File')
require('dotenv').config()

const router = express.Router()
const upload = multer({ dest: 'uploads'})


router.get('/', (req, res) => {
    res.render('index')
})

router.post('/upload', upload.single('file'), async (req, res) => {
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

router.route('/file/:id').get(download).post(download)

async function download(req, res) {
    const file = await File.findById(req.params.id)

    if (file.password != null) {
        if (req.body.password == null) {
            res.render('password', { name: file.originalName})
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

module.exports = router