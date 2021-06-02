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
        required:true,
    },
    tutor: {
        type: Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true,
    },
    banner: {
        type: String
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: Subject
    },
    tags: {
        type: [String]
    },
    fee: {
        type: Schema.Types.Decimal128,
        required: true
    },
    schedule: [{
        day: String,
        startTime: String,
        endTime: String
    }],
}, {timestamps: true})

const Class = model('Class', classSchema)

module.exports = Class