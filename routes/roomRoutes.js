const router = require('express').Router()

const Tutor = require('../models/Tutor') 
const Student = require('../models/Student') 
const Class = require('../models/Class')
const EnrolledClass = require('../models/EnrolledClass') 

router.get('/:room', async (req, res) => {

    if(!req.user){
        res.redirect('/')
    }
    if(!req.session.isLoggedIn){
        res.redirect('/')
    }

    let roomId = req.params.room
    let userId = req.user._id
    let userType = req.session.userType

    try{
        let liveClass = await EnrolledClass.findOne({roomId: roomId})
        let classDetails = await Class.findOne({_id: liveClass.enrolledClass})
        let tutor = await Tutor.findOne({_id: liveClass.tutor})
        let student = await Student.findOne({_id: liveClass.student})

        if(!req.session.isLoggedIn){
            return res.redirect('/student/')
        }
        if(userType === 'tutor' && userId.toString() !== liveClass.tutor.toString()){
            return res.redirect('/tutor/enrolled_classes')
        }
        if(userType === 'student' && userId.toString() !== liveClass.student.toString()){
            return res.redirect('/student/enrolled_classes')
        }

        if(userType === 'tutor'){
            liveClass.userName = tutor.name
            liveClass.participantName = student.name
            liveClass.userType = userType
        }
        if(userType === 'student'){
            liveClass.userName = student.name
            liveClass.participantName = tutor.name
            liveClass.userType = userType

        }    
        liveClass.title = classDetails.title
        res.render('common/room.ejs', { liveClass:liveClass })

    }catch(e){
        console.log(e)
        if(req.user.userType === 'tutor'){
            return res.redirect('/tutor/enrolled_classes')
        }
        if(req.user.userType === 'student'){
            return res.redirect('/student/enrolled_classes')
        }
        res.redirect('/')
    }
})


module.exports = router