const Tutor = require('../models/Tutor')
const Student = require('../models/Student')

exports.bindUserWithRequest = () => {
    return async (req, res, next) => {
        if( !req.session.isLoggedIn){
            return next()
        }

        try{
            let user;
            if(req.session.userType === 'tutor'){
                user = await Tutor.findById(req.session.user._id)
            }else if(req.session.userType === 'student'){
                user = await Student.findById(req.session.user._id)
            }
            if(user){
                req.user = user
                next()
            }else{
                console.log(">>>>>>>>>>>>>>bind user with requrest error")
                next()
            }
        }catch(e){
            console.log(">>>>>>>>>>>>>>>>>>>>bind user with requres error catched" + e)
            next(e)
        }
    }
}


exports.isAuthenticatedTutor = (req, res, next) => { 
    if(req.session.isLoggedIn && req.session.userType === 'tutor'){
        next()
    }else{
        return res.redirect('/tutor/login')
    }
    
}

exports.isAuthenticatedStudent = (req, res, next) => { 
    if(req.session.isLoggedIn && req.session.userType === 'student'){
        next()
    }else{
        return res.redirect('/student/login')
    }
    
}


exports.isUnAuthenticatedTutor = (req, res, next) => {
    if(req.session.isLoggedIn && req.session.userType == 'tutor'){
        return res.redirect('/tutor/dashboard')
    }
    next()
}

exports.isUnAuthenticatedStudent = (req, res, next) => {
    if(req.session.isLoggedIn && req.session.userType == 'student'){
        return res.redirect('/student/dashboard')
    }
    next()
}