const bcrypt = require("bcrypt");
const {
    validationResult
} = require('express-validator')

const Tutor = require("../models/Tutor")
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
            res.json({
                message: "Invalid credintials",
            });
        }

        let match = await bcrypt.compare(password, tutor.password);

        if (!match) {
            res.json({
                message: "Invalid credentials",
            });
        }
        req.session.isLoggedIn = true
        req.session.user = tutor
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

exports.dashboardGetController = (req, res, next) => {
    res.render('tutor/dashboard')
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

/*
module.exports = {

    renderDashboard: function(req, res){
        passport.authenticate('tutorLocal', { failureRedirect: '/tutor/signin'})(req, res, function () {
            res.render('tutor/dashboard')
        });
    },

    signin: function(req,res){
        res.render('tutor/signin')
    },


    signup: function(req,res){
        res.render('tutor/signup')
    },


    signupTutor: function(req,res){
        Tutor.register(new Tutor({ 
            email : req.body.email, 
            name: req.body.name, 
          }), req.body.password, function(err, user) {
          if (err) {
            console.log(err);
            return res.render('tutor/signup', { user : user });
          }
      
          passport.authenticate('tutorLocal')(req, res, function () {
            res.redirect('/tutor/signin');
          });
        });
    },

    signinTutor: function(req,res){
        passport.authenticate('tutorLocal')(req, res, function () {
            //res.redirect('/');
            res.send('<h1>logged in</h1>')
          });
    }

}

*/