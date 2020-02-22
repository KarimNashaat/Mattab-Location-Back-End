const mongoose = require('mongoose')
const validator = require('validator')
const routeSchema = mongoose.Schema({
    from: {
        type: String,
        trim: true,
        required: true
    },
    to: {
        type: String,
        
        trim: true,
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
        }
    }],
    owner_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
    ownerName:{
            type: String,
            trim: true,
            required: true
        },
    ownerImg: {
        type: Buffer
    }
}, {
    timestamps: true
}
)

const Route = mongoose.model('Route', routeSchema)

module.exports = Route