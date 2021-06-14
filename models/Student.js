const {Schema, model} = require('mongoose')



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
        required:true
    }
},  {
    timestamps: true
})


const Student = model('Student', studentSchema)


module.exports = Student