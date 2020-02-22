require('./db/mongoose')
const express = require('express')
const app = express()
const cors = require('cors')

const userRouter = require('./routers/user')
const routeRouter = require('./routers/route')

app.use(cors())

app.use(express.json())
app.use(userRouter)
app.use(routeRouter)

module.exports = app