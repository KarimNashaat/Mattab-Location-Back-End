const express = require("express")
const router = express.Router()
const Route = require("../models/routes")
const auth = require('../middleware/auth')
const User = require('../models/users')

router.post('/routes', auth, async (req, res) => {
    try {
        const route = new Route({
            ...req.body,
            owner_id: req.user._id,
            ownerName: req.user.name,
            ownerImg: req.user.avatar
        })
        await route.save()
        await req.user.populate({ 'path': 'routes' }).execPopulate()
        res.status(201).send({routes: req.user.routes})
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/routes', async (req, res) => {
    try {
        const from = req.query.from
        const to = req.query.to
        let routes = null
        if (to === "" || to === undefined) {
            routes = await Route.find({ from })
        }
        else {
            routes = await Route.find({ from }).find({ to })
        }

        // await req.user.populate({
        //     'path': 'routes'
        // }).execPopulate()
        res.send(routes)
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/routes/:id', auth, async (req, res) => {
    try {
        console.log('here')
        const routeId = req.params.id
        const user =req.user

        if(!user._id === (routeId)){
            return res.status(401).send(e.message)
        }

        await Route.findByIdAndRemove(routeId)

        let users = await User.find({"savedRoutes._id": routeId})
        users = users.map(u => {
            u.savedRoutes=  u.savedRoutes.filter( savedRoute => !savedRoute._id.equals(routeId))
            return u
        })

        users.forEach(async user => await user.save())

        await req.user.populate({ 'path': 'routes' }).execPopulate()
        res.status(201).send({routes: req.user.routes})
    }
    catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router 