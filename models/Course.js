const {Schema, model} = require('mongoose')

const Subject  = require('./Subject')
const Tutor = require('./Tutor') 

const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlenght: 100
    },
    description: {
        type: String,
        maxlength: 1000,
    },
    tutor: {
        type: Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true
    },
    banner: {
        type: String
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'Subject'
    },
    tags: {
        type: [String],
        required: true
    },
    fee: {
        type: Number,
        required: true,
    },
    videos: [
        {title: String, path: String}
    ],
}, {timestamps: true})

const Course = model('Course', courseSchema)

module.exports = Course