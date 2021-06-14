const bcrypt = require("bcrypt");
const fs = require('fs')
const {
    validationResult
} = require('express-validator')
const { v4: uuidV4 } = require('uuid')

const Student = require("../models/Student")
const Class = require('../models/Class')
const Tutor = require('../models/Tutor')
const EnrolledClass = require('../models/EnrolledClass')
const errorFormatter = require('../utils/validationFormatter')

//const passport = require('../passport')

exports.registerGetController = (req, res, next) => {
    res.render("student/register", {error: {}, value: {}});
};

exports.registerPostController = async (req, res, next) => {

    let {
        email,
        password,
        name
    } = req.body;

    let error = validationResult(req).formatWith(errorFormatter)

    if(!error.isEmpty()){
        return res.render('student/register',{error: error.mapped(), value: {email, name}, alert:{}})
    }

    try {
        let hashedPassword = await bcrypt.hash(password, 10);

        let newStudent = new Student({
            email,
            name,
            password: hashedPassword,
        });

        let createdStudent = await newStudent.save();
        console.log("Created user", createdStudent);
        res.render("student/login", {error:{}, alert:{message:'Successfully registered user!', status:'success'}, value: {}});
    } catch (e) {
        console.log(e);
        res.render("student/register", {erorr:{}, alert:{message:'Registration failed', status:'danger'}, value: {}});
    }
};

exports.loginGetController = (req, res, next) => {
    res.render("student/login", {value: {}, error: {}, alert:{}});
};

exports.loginPostController = async (req, res, next) => {
    let {
        email,
        password
    } = req.body;

    let error = validationResult(req).formatWith(errorFormatter)
    console.log(error)

    if(!error.isEmpty()){
        console.log("validation error" + error)
        return res.render('student/login', {value: {email, password}, error: error.mapped(), alert:{}})
    }

    try {
        let student = await Student.findOne({
            email
        });

        if (!student) {
          return res.render('student/login', {value: {email, password}, error: {}, alert: {message:'Invalid credentials', status: 'warning'}})
        }

        let match = await bcrypt.compare(password, student.password);

        if (!match) {
          return res.render('student/login', {value: {email, password}, error: {}, alert: {message:'Invalid credentials', status: 'warning'}})
        }

        req.session.isLoggedIn = true
        req.session.user = student
        req.session.userType = 'student'
        req.session.save( err => {
            if(err){
                console.log("error saving session" + err)
                return next(err)
            }
            res.redirect("/student/dashboard");
        })
        
    } catch (e) {
        console.log("error in login catch block" + e);
        next(e);
    }
};


exports.logoutController = (req, res, next) => {

    req.session.destroy( err => {
        if(err){
            console.log(err);
            return next(err);
        }
        return res.redirect('/student/login')
    })

};


exports.dashboardGetController = async (req, res, next) => {

    try{
        let student = req.user._id
        let enrolledClasses = await EnrolledClass.find({student: student})

        for(let enrolledClass of enrolledClasses){
            let classDetails = await Class.findOne({_id: enrolledClass.enrolledClass})
            let tutor = await Tutor.findOne({_id: enrolledClass.tutor})
            let attendee = await Student.findOne({_id: enrolledClass.studnet})
            enrolledClass.attendee = attendee
            enrolledClass.tutorName = tutor.name;
            enrolledClass.title = classDetails.title;
        }
        enrolledClasses = enrolledClasses.slice(0,2)

        let classes = await Class.find()

        for(let singleClass of classes){
            let tutor = await Tutor.findOne({_id: singleClass.tutor})
            singleClass.tutorName = tutor.name;
        }
        classes =classes.slice(0,2)

        let tutors = await Tutor.find()
        tutor = tutors.slice(0,2)

        res.render('student/dashboard',{classes, enrolledClasses, tutors, alert: {}})        

    }catch(e){
        console.log(e)
        res.render('student/dashboard', {classes:{}, enrolledClasses:{}, tutors:{}, alert: {message:'Failed to get contents.', status: 'warning'}})
    }
}



exports.classesGetController = async (req, res, next) => {

    try{
        let classes = await Class.find()

        for(let singleClass of classes){
            let tutor = await Tutor.findOne({_id: singleClass.tutor})
            singleClass.tutorName = tutor.name;
        }
        res.render('student/classes',{classes,title: {header: 'All Classes'}, alert: {}})        

    }catch(e){
        console.log(e)
        res.render('student/classes', {alert: {message:'Failed to get classes.', status: 'warning'}})
    }
}

exports.classDetailsGetController = async (req, res, next) => {
    let classId = req.params.id;
    
    try{
        let classDetails = await Class.findOne({_id: classId})
        let tutor = await Tutor.findOne({_id: classDetails.tutor})
        res.render('student/classDetails', {classDetails, tutor, alert:{}})
    }catch(e){
        console.log(e);
        res.redirect('/student/classes')
    }
}


exports.tutorDetailsGetController = async (req, res, next) => {

    let tutorId = req.params.id;
    
    try{
        let tutorDetails = await Tutor.findOne({_id: tutorId})
        let classes = await Class.find({tutor: tutorId})
        res.render('student/tutorDetails', {tutor: tutorDetails, classes, alert:{}})
    }catch(e){
        console.log(e);
        res.redirect('/student/dashboard')
    }


}


exports.searchClassesGetController = async (req, res, next) => {

    let searchTerm = req.query.search
    
    try{
        let classes = await Class.find({
            $text:{
                $search: searchTerm
            }
        })

        for(let singleClass of classes){
            let tutor = await Tutor.findOne({_id: singleClass.tutor})
            singleClass.tutorName = tutor.name;
        }
        res.render('student/classes',{classes,title: {header: `Results for "${searchTerm}"`}, alert:{}})        

    }catch(e){
        console.log(e)
        res.render('student/classes', {alert: {message:'Failed to get classes.', stutus: 'warning'}})
    }
}

//todo: make sucere

exports.enrollGetController = async (req, res, next) => {
    let classId = req.params.id
    try{
        let enrolledClass = await Class.findOne({_id: classId})
        let student = req.user._id
        let tutor = enrolledClass.tutor
        let roomId = uuidV4()
        let tutorDetails = await Tutor.findOne({_id: tutor})

        let enrolledClassObj = new EnrolledClass({
            enrolledClass: classId,
            student,
            tutor,
            roomId
        })
        let createdObj = await enrolledClassObj.save()
        res.redirect('/student/enrolled_classes')
    }catch(e){
        console.log(e)
        res.render('student/classDetails', {enrolledClass, tutorDetails, alert: {message: 'Could not enroll into class', status: 'warning'}})
    }
}



exports.enrolledClassesGetController = async (req, res, next) => {

    try{
        let student = req.user._id
        let enrolledClasses = await EnrolledClass.find({student: student})

        for(let enrolledClass of enrolledClasses){
            let classDetails = await Class.findOne({_id: enrolledClass.enrolledClass})
            let tutor = await Tutor.findOne({_id: enrolledClass.tutor})
            let attendee = await Student.findOne({_id: enrolledClass.studnet})
            enrolledClass.attendee = attendee
            enrolledClass.tutorName = tutor.name;
            enrolledClass.title = classDetails.title;
        }

        res.render('student/enrolledClasses',{enrolledClasses, alert:{}})        

    }catch(e){
        console.log(e)
        res.render('student/enrolledClasses', {enrolledClasses:{},alert: {message:'Failed to get classes for this user'}})
    }

}

exports.unenrollGetController = async (req, res, next) => {

    let enrolledClassId = req.params.id;
    
    try{
        let deletedEnrolledClass = await EnrolledClass.findOneAndDelete({_id: enrolledClassId})
        res.redirect('/student/enrolled_classes')
    }catch(e){
        console.log(e);
        res.render('student/enrolledClasses', {enrolledClasses:{}, alert: {message:'Failed to cancel class schedule'}})
    }
}



exports.paymentCancelController = async (req,res, next) => {
    let classId = req.params.id;
    try{
        let classDetails = await Class.findOne({_id: classId})
        let tutor = await Tutor.findOne({_id: classDetails.tutor})
        res.render('student/classDetails', {classDetails, tutor, alert:{message: 'Payment cancelled!'}})
    }catch(e){
        console.log(e);
        res.redirect('/student/classes')
    }
}


exports.joinLiveClass = async (req, res, next) => {
    let enrolledClassId = req.params.id
    try{
        let enrolledClass = await EnrolledClass.findOne({_id: enrolledClassId})
        let roomId = enrolledClass.roomId
        let studentId = enrolledClass.student 
        if( studentId.toString() === req.user._id.toString()){
            res.redirect(`/room/${roomId}`)
        }
        res.redirect('/student/enrolled_classes')
    }catch(e){
        console.log(e)
        res.redirect('/student/enrolled_classes')
    }
}