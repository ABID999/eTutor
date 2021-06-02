const {Schema, model} = require('mongoose')

const Course = require('./Course')
const Class = require('./Class')

const tutorSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required:true  
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        require: true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    qualifications: {
        type: String,
        trim: true,
        maxlenght: 200,
    },
    profilePicture: {
        type: String,
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],

    classes: [{
        type: Schema.Types.ObjectId,
        ref: 'Class'
    }],

}, {timestamps: true})


//tutorSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

const Tutor = model('Tutor', tutorSchema)

module.exports = Tutor