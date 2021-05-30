const express = require('express')
const morgan = require('morgan')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
//const passport = require('passport')
//const {Strategy} = require('passport-local')

const Student = require('./models/Student')
const Tutor = require('./models/Tutor')
const auth = require('./routes/auth')
const tutorRoutes = require('./routes/tutorRoutes')
const {bindTutorWithRequest} = require('./middleware/authMiddleWare')
const setLocals = require('./middleware/setLocals')
//const passport = require('./passport')

//mongoose.Promise = global.Promise
const MONGODB_URI = 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb'

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
    expires: 3600 * 1000 * 2
})


mongoose.connect(MONGODB_URI, {useNewUrlParser : true, useUnifiedTopology: true})
    .then( ()=> console.log('db connection successful'))
    .catch( (err)=> console.log(err+ 'db connection unsuccessful'))



const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const middleware = [
    morgan('dev'),
    express.static('public'),
    express.urlencoded({extended: true}),
    express.json(),
    session({
        secret: process.env.SECRET_KEY || 'MONKEY',
        resave: false,
        saveUninitialized: false,
        store: store
    }),
    bindTutorWithRequest(),
    setLocals()
    //passport.initialize(),
    //passport.session(),
]

app.use(cookieParser());


app.use(middleware)

app.use('/auth', auth);
app.use('/tutor', tutorRoutes)

app.get('/', (req, res)=>{
    res.json({
        message: 'Hello World'
    })
})

app.use( (req,res, next) => {
    let error = new Error('404 page not found')
    error.status = 404
    next(error)
})
app.use( (error, req, res, next) => {
    if(error.status === 404){
        return res.render('error/404.ejs')
    }
    //return res.render('error/500.ejs')
})

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})