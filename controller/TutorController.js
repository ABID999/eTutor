const bcrypt = require("bcrypt");
const fs = require('fs')
const {
    validationResult
} = require('express-validator')

const Tutor = require("../models/Tutor")
const Student = require("../models/Student")
const EnrolledClass = require("../models/EnrolledClass")
const Class = require('../models/Class')
const Course = require('../models/Course')
const errorFormatter = require('../utils/validationFormatter')

//const passport = require('../passport')

exports.registerGetController = (req, res, next) => {
    res.render("tutor/register", {error: {}, value: {}});
};

exports.registerPostController = async (req, res, next) => {

    let {
        email,
        password,
        name
    } = req.body;

    let error = validationResult(req).formatWith(errorFormatter)

    if(!error.isEmpty()){
        return res.render('tutor/register',{error: error.mapped(), value: {email, name}})
    }

    try {
        

        let hashedPassword = await bcrypt.hash(password, 10);

        let tutor = new Tutor({
            email,
            name,
            password: hashedPassword,
        });

        let createdTutor = await tutor.save();
        console.log("Created user", createdTutor);
        res.render("tutor/login", {error: {}, value: {}});
    } catch (e) {
        console.log(e);
        res.render("tutor/register");
    }
};

exports.loginGetController = (req, res, next) => {
    res.render("tutor/login", {value: {}, error: {}});
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
        return res.render('tutor/login', {value: {email, password}, error: error.mapped()})
    }

    try {
        let tutor = await Tutor.findOne({
            email
        });

        if (!tutor) {
            return res.render('tutor/login', {value: {email, password}, error: error.mapped()})
        }

        let match = await bcrypt.compare(password, tutor.password);

        if (!match) {
            return res.render('tutor/login', {value: {email, password}, error: error.mapped()})
        }
        req.session.isLoggedIn = true
        req.session.user = tutor
        req.session.userType = 'tutor'
        req.session.save( err => {
            if(err){
                console.log("error saving session" + err)
                return next(err)
            }
            res.redirect("/tutor/dashboard");
        })
        
    } catch (e) {
        console.log("error in login catch block" + e);
        next(e);
    }
};


exports.dashboardGetController = async (req, res, next) => {

    try{
        let tutor = req.user._id
        let enrolledClasses = await EnrolledClass.find({tutor: tutor})

        for(let enrolledClass of enrolledClasses){
            let classDetails = await Class.findOne({_id: enrolledClass.enrolledClass})
            let tutor = await Tutor.findOne({_id: enrolledClass.tutor})
            let attendee = await Student.findOne({_id: enrolledClass.studnet})
            enrolledClass.attendee = attendee
            enrolledClass.tutorName = tutor.name;
            enrolledClass.title = classDetails.title;
        }
        enrolledClasses = enrolledClasses.slice(0,2)

        let classes = await Class.find({tutor: tutor})
        classes =classes.slice(0,2)

        let courses = await Course.find({tutor: tutor})
        courses =courses.slice(0,2)

        res.render('tutor/dashboard',{classes, enrolledClasses, courses, alert: {}})        

    }catch(e){
        console.log(e)
        res.render('tutor/dashboard', {classes:{}, enrolledClasses:{}, courses:{}, alert: {message:'Failed to get contents.', status: 'warning'}})
    }
}

exports.logoutController = (req, res, next) => {

    req.session.destroy( err => {
        if(err){
            console.log(err);
            return next(err);
        }
        return res.redirect('/tutor/login')
    })

};

exports.profileGetController = async (req, res, next) => {

    // let tutorId = req.session.user;
    // let tutor = await Tutor.findOne({user})
    let tutor = req.user;

    res.render('tutor/profile', {user: tutor})
}

exports.editProfileGetController = (req, res, next) => {

    let tutor = req.user;

    res.render('tutor/editProfile', {user: tutor, alert: {} })
}

exports.editProfilePostController = async (req, res, next) => {

    try{    
        let profilePicture
        if(req.file){
            profilePicture = `uploads/profile/${req.file.filename}`
            console.log(profilePicture)
        }else{
            profilePicture = null
        }

        let tutor = await Tutor.findOne({_id: req.user._id})
        if(tutor.profilePicture){
            fs.unlinkSync(`public/${tutor.profilePicture}`)
        }

        let newTutor = {
            name: req.body.name,
            bio: req.body.bio,
            qualifications: req.body.qualifications,
            profilePicture
        }

        let updatedTutor = await Tutor.findOneAndUpdate(
            {_id: req.user._id},
            {$set: newTutor},
            {new: true}
        )

        res.render('tutor/profile', {user: updatedTutor})
    
    }catch(e){
        console.log(e);
        res.render("tutor/editProfile", {user:req.user, alert: {message: 'Error on updating profile', status: 'danger'}});
    }
}

exports.classesGetController = async (req, res, next) => {

    try{
        let classes = await Class.find({tutor: req.user._id})
        res.render('tutor/classes',{classes, error:{}})        

    }catch(e){
        console.log(e)
        res.render('tutor/classes', {error: {message:'Failed to get classes for this user'}})
    }


}

exports.createClassGetController = async (req, res, next) => {
    res.render('tutor/createClass')
}

exports.createClassPostController = async (req, res, next) => {
    let {title, description, fee, tags} = req.body

    if(tags){
        tags = tags.split(',')
        tags = tags.map(tag => {return tag.trim()})
    }

    let banner;
    if(req.file){
        console.log(req.file)
        banner = `uploads/banner/${req.file.filename}`
    }else{
        banner = null
    }

    let newClass = new Class({
        title,
        description,
        tags,
        tutor: req.user._id,
        banner,
        fee,
    })

    try{
        let createdClass= await newClass.save()
        let tutor = await Tutor.findOneAndUpdate(
            {_id: req.user._id},
            {$push: {'classes': createdClass._id}}
        )
        res.redirect('/tutor/classes')
    }catch(e){
        console.log(e)
        res.render('tutor/createClass')
    }
}

exports.classDetailsGetController = async (req, res, next) => {

    let classId = req.params.id;
    
    try{
        let classDetails = await Class.findOne({_id: classId})
        let tutor = await Tutor.findOne({_id: classDetails.tutor})
        res.render('tutor/classDetails', {classDetails, tutor})
    }catch(e){
        console.log(e);
        res.redirect('/tutor/classes')
    }


}

exports.editClassGetController = async (req, res, next) => {

    let classId = req.params.id;
    
    try{
        let classDetails = await Class.findOne({_id: classId})
        res.render('tutor/editClass', {classDetails})
    }catch(e){
        console.log(e);
        res.redirect(`/tutor/class/${classId}`)
    }
}

exports.editClassPostController = async (req, res, next) => {

    try{    
        let {
            id,
            title,
            description,
            tags,
            fee
        } = req.body

        if(tags){
            tags = tags.split(',')
            tags = tags.map(tag => {return tag.trim()})
        }

        let classPrev = await Class.findOne({_id: id})

        let banner
        if(req.file){
            banner = `uploads/banner/${req.file.filename}`
            console.log(banner)
        }else{
            banner = classPrev.banner
        }
        
        if(classPrev.banner !== banner && classPrev.banner != null && classPrev.banner != ''){
            try{
                fs.unlinkSync(`public/${classPrev.banner}`)
            }catch(e){
                console.log(e)
            }
        }

        let newClass = {
            title,
            description,
            banner,
            fee,
            tags
        }

        let updatedClass = await Class.findOneAndUpdate(
            {_id: id},
            {$set: newClass},
            {new: true}
        )

        res.redirect(`/tutor/class/${id}`)
    
    }catch(e){
        console.log(e);
        res.redirect(`/tutor/edit_class/${req.body.id}`);
    }
}

exports.deleteClassGetController = async (req, res, next) => {

    let classId = req.params.id;
    
    try{
        let classDetails = await Class.findOneAndDelete({_id: classId})
        res.redirect('/tutor/classes')
    }catch(e){
        console.log(e);
        res.redirect(`/tutor/class/${classId}`)
    }
}

exports.changePasswordPostController = async (req, res, next) => {

    try{
        let tutor = await Tutor.findOne({_id: req.user._id})
        let {newPassword, confirmNewPassword, currentPassword} = req.body

        

        let currentPasswordMatch = await bcrypt.compare(currentPassword, tutor.password);
        let newPasswordMatch = await bcrypt.compare(newPassword, tutor.password);

        if(!currentPasswordMatch){
            return res.render('tutor/editProfile', {alert: {message: 'Current password incorrect', status: 'danger'}})
        }
        if(newPasswordMatch){
            return res.render('tutor/editProfile', {alert: {message: 'New password cannot be old password', status: 'danger'}})
        }
        if(newPassword != confirmNewPassword){
            return res.render('tutor/editProfile', {alert: {message: 'Please confirm new password', status: 'warning'}})
        }

        let hashedPassword = await bcrypt.hash(newPassword, 10);

        let newTutor = await Tutor.findOneAndUpdate({_id:tutor._id}, {password: hashedPassword})
        
        return res.render('tutor/editProfile', {alert: {message: 'Password update successfully', status: 'success'}})

    }catch(e){
        console.log(e)
        return res.render('tutor/editProfile', {alert: {message: 'Erron changing password', status: 'danger'}})
    }
}


exports.enrolledClassesGetController = async (req, res, next) => {

    try{
        let tutor = req.user._id
        let enrolledClasses = await EnrolledClass.find({tutor: tutor})
        console.log(enrolledClasses)
        for(let enrolledClass of enrolledClasses){
            let classDetails = await Class.findOne({_id: enrolledClass.enrolledClass})
            let tutor = await Tutor.findOne({_id: enrolledClass.tutor})
            let attendee = await Student.findOne({_id: enrolledClass.studnet})
            enrolledClass.attendee = attendee
            enrolledClass.tutorName = tutor.name;
            enrolledClass.title = classDetails.title;
        }

        res.render('tutor/enrolledClasses',{enrolledClasses, alert:{}})        

    }catch(e){
        console.log(e)
        res.render('tutor/enrolledClasses', {enrolledClasses:{},alert: {message:'Failed to get classes for this user'}})
    }

}


exports.cancelClassGetController = async (req, res, next) => {

    let enrolledClassId = req.params.id;
    
    try{
        let deletedEnrolledClass = await EnrolledClass.findOneAndDelete({_id: enrolledClassId})
        res.redirect('/tutor/enrolled_classes')
    }catch(e){
        console.log(e);
        res.render('tutor/enrolledClasses', {enrolledClasses:{}, alert: {message:'Failed to cancel class schedule'}})
    }
}


exports.joinLiveClassController = async (req, res, next) => {
    let enrolledClassId = req.params.id
    try{
        let enrolledClass = await EnrolledClass.findOne({_id: enrolledClassId}) 
        let roomId = enrolledClass.roomId
        let tutor = enrolledClass.tutor
        if( tutor.toString() == req.user._id.toString()){
            res.redirect(`/room/${roomId}`)
        }
        res.redirect('/tutor/enrolled_classes')
    }catch(e){
        console.log(e)
        res.redirect('/tutor/enrolled_classes')
    }
}

exports.coursesGetController = async (req, res, next) => {

    try{
        let courses = await Course.find({tutor: req.user._id})
        res.render('tutor/courses',{courses, error:{}})        

    }catch(e){
        console.log(e)
        res.render('tutor/courses', {error: {message:'Failed to get courses for this user'}})
    }


}

exports.courseDetailsGetController = async (req, res, next) => {

    let courseId = req.params.id;
    
    try{
        let courseDetails = await Course.findOne({_id: courseId})
        res.render('tutor/viewCourse', {courseDetails})
    }catch(e){
        console.log(e);
        res.redirect('/tutor/courses')
    }


}


exports.createCourseGetController = async (req, res, next) => {
    res.render('tutor/createCourse')
}



exports.createCoursePostController = async (req, res, next) => {
    let {title, description, fee, tags} = req.body

    if(tags){
        tags = tags.split(',')
        tags = tags.map(tag => {return tag.trim()})
    }
    let banner;
    let videos =[];

    if(req.files){
        console.log(req.files)
        if(req.files['course-banner'][0]){
            banner = `uploads/banner/${req.files['course-banner'][0].filename}`
        }else{
            banner = null
        }
        
        req.files['course-videos'].forEach(element => {
            videos.push({title:`${element.originalname}`, path: `uploads/course/${element.filename}`})
        });
    }

    let newCourse = new Course({
        title,
        description,
        tags,
        tutor: req.user._id,
        banner,
        fee,
        videos
    })

    try{
        let createdCourse= await newCourse.save()
        let tutor = await Tutor.findOneAndUpdate(
            {_id: req.user._id},
            {$push: {'courses': createdCourse._id}}
        )
        res.redirect('/tutor/courses')
    }catch(e){
        console.log(e)
        res.render('tutor/createCourse')
    }
}

