const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Route = require('./routes')

const recordingSchema = mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    checkpoints: [{
            lat: {
                type: Number,
                required: true
            },
            long: {
                type: Number,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
    }],
    initialLocation: {
        lat: {
            type: Number,
            required: true
        },
        long: {
            type: Number,
            required: true
        }
    }
})

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password include password word.")
            }
        }
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("This is not correct email format.")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age can not be negative number.")
            }
        }
    },
    phone: {
        type: String
    },
    job: {
        type: String
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    },
    recording: {
        type: recordingSchema,
        required: false
    },
    savedRoutes: [{
        type: Route.schema
    }]
}, {
    timestamps: true
})

userSchema.virtual('routes', {
    ref: 'Route',
    localField: '_id',
    foreignField: 'owner_id'
})

userSchema.methods.toJSON = function () {
    /* This function is always called by the stringfy method that is called by the res.send
    */
    const user = this
    const userObject = user.toObject() // Converting into bare Object to remove all the mongoose stuff like .save() and so

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.GenerateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.FindByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("Unable to Login")
    }
    const validPass = await bcrypt.compare(password, user.password)
    if (!validPass) {
        throw new Error("Unable to Login")
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User