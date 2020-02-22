const express = require("express")
const router = express.Router()
const User = require("../models/users")
const path = require('path')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const moment = require('moment')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a jpg or jpeg or png file'))
        }

        cb(undefined, true)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.FindByCredentials(req.body.email, req.body.password)
        const token = await user.GenerateAuthToken()
        await user.populate({ 'path': 'routes' }).execPopulate()
        res.status(200).send({ user, routes: user.routes, token })
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/auto-login', auth, async (req, res) => {
    try {
        const user = req.user
        await user.populate({ 'path': 'routes' }).execPopulate()
        res.status(200).send({ user, routes: user.routes, token: req.token })
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/signup', upload.single('avatar'), async (req, res) => {
    const userData = JSON.parse(req.body.userData)
    
    if (req.file) {
        const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
        userData.avatar = buffer
    }

    userData.age = moment().diff(moment(userData.birthday,"M/D/YYYY"),'years')
    const user = new User(userData)
    try {
        await user.save()

        const token = await user.GenerateAuthToken()
        res.status(201).send({ user, token })

    } catch (e) {
        console.log(e)
        res.status(400).send(e.message)
    }

})

router.get('/user/recording', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    try {
        const user = await User.findById(req.params.id)
        res.status(201).send(user)

    } catch (e) {
        console.log(e)
        res.status(400).send(e.message)
    }

})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("Logged Out")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/user/recording', auth, async (req, res) => {
    try {
        req.user.recording = { ...req.body }
        await req.user.save()
        res.status(201).send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/user/recording', auth, async (req, res) => {
    try {
        req.user.recording.checkpoints = req.user.recording.checkpoints.concat({ ...req.body })
        await req.user.save()
        res.status(201).send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/user/recording', auth, async (req, res) => {
    try {
        req.user.recording = null
        await req.user.save()
        res.status(201).send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/user/recording/:id', auth, async (req, res) => {
    try {
        const id = req.params.id
        console.log(req.params.id)
        req.user.recording.checkpoints = req.user.recording.checkpoints.filter(checkpoint => !checkpoint._id.equals(id))
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})


router.post('/user/savedroutes/', auth, async (req, res) => {
    try {
        req.user.savedRoutes = req.user.savedRoutes.concat(req.body)
        await req.user.save()
        res.status(201).send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/user/savedroutes/:id', auth, async (req, res) => {
    try {
        req.user.savedRoutes = req.user.savedRoutes.filter( route => !route._id.equals(req.params.id))
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router 