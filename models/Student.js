//Name, email, password profile

const {Schema, model} = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')


const studentSchema = new Schema({
    name: {
        type: String, 
        trim: true,
        maxlength: 30,
        required: true
    },
    email:{
        type: String,
        trim: true,
        required: true,
        maxlength: 50
    },
    password: {
        type: String, 
        maxlength: 50,
    }
},  {
    timestamps: true
})

studentSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

const Student = model('Student', studentSchema)


module.exports = Student