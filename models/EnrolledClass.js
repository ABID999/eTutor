const {Schema, model} = require('mongoose')

const Tutor = require('./Tutor') 
const Student = require('./Student') 
const Class = require('./Class') 


const enrolledClassSchema = new Schema({

    enrolledClass: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    tutor: {
        type: Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true,
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    roomId: {
        type: String,
        required: true
    },
    schedule: [{
        day: String,
        startTime: String,
        endTime: String
    }],
}, {timestamps: true})

const EnrolledClass = model('EnrolledClass', enrolledClassSchema)

module.exports = EnrolledClass