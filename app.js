const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const morgan = require('morgan')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const studentRoutes = require('./routes/studentRoutes')
const tutorRoutes = require('./routes/tutorRoutes')
const roomRoutes = require('./routes/roomRoutes')
const {bindUserWithRequest} = require('./middleware/authMiddleWare')
const setLocals = require('./middleware/setLocals')


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
    bindUserWithRequest(),
    setLocals()

]

app.use(cookieParser());


app.use(middleware)

app.use('/student', studentRoutes)
app.use('/tutor', tutorRoutes)
app.use('/room', roomRoutes)

app.get('/', (req, res)=>{
    res.render('landingPage.ejs')
})
  
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})
  




// app.use( (req,res, next) => {
//     let error = new Error('404 page not found')
//     error.status = 404
//     next(error)
// })
// app.use( (error, req, res, next) => {
//     if(error.status === 404){
//         return res.render('error/404.ejs')
//     }
//     //return res.render('error/500.ejs')
// })

const PORT = process.env.PORT || 8080


server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})