const {Schema, model} = require('mongoose')

const Subject  = require('./Subject')
const Tutor = require('./Tutor') 


const classSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlenght: 100
    },
    description: {
        type: String,
        maxlength: 1000,
    },
    // tutor: {
    //     type: Schema.Types.ObjectId,
    //     ref: Tutor,
    //     required: true,
    // },
    subject: {
        type: Schema.Types.ObjectId,
        ref: Subject,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    fee: {
        type: Number,
        required: true,
        required: true
    },
    schedule: [{
        day: String,
        time: String,
    }],
}, {timestamps: true})

const Class = model('Class', classSchema)

module.exports = Class