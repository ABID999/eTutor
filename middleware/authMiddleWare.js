const Tutor = require('../models/Tutor')

exports.bindTutorWithRequest =() => {
    return async (req, res, next) => {
        if( !req.session.isLoggedIn){
            return next()
        }

        try{
            let user = await Tutor.findById(req.session.user._id)
            req.user = user
            next()
        }catch(e){
            console.log("bind user with requres error" + e)
            next(e)
        }
    }
}


exports.isAuthenticated = (req, res, next) => { 
    if(!req.session.isLoggedIn){
        return res.redirect('/tutor/login')
    }
    next()
}

exports.isUnAuthenticated = (req, res, next) => {
    if(req.session.isLoggedIn){
        return res.redirect('/tutor/dashboard')
    }
    next()
}