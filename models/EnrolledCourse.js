const {Schema, model} = require('mongoose')

const Tutor = require('./Tutor') 
const Student = require('./Student') 
const Course = require('./Course') 


const enrolledCourseSchema = new Schema({

    enrolledCourse: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
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
    }
}, {timestamps: true})

const EnrolledCourse = model('EnrolledCourse', enrolledCourseSchema)

module.exports = EnrolledCourse