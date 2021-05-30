const {Schema, model} = require('mongoose')


const subjectSchema = new Schema({
    name: [String]
})

const Subject = model('Subject', subjectSchema)

module.exports = Subject