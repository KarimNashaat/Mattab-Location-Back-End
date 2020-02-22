const User = require('../models/users')
const jwt = require('jsonwebtoken')

const auth = async(req, res, next) => {
    try{
        const token = req.header("Authorization").replace('Bearer ', '')
        const validToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: validToken._id, "tokens.token": token})
        if(!user){
            throw new Error("Not Authorized")
        }
        req.token = token
        req.user = user 
        next()
    }
    catch(e){
        res.status(401).send("Not Authorized")
    }

}


module.exports = auth