const passport = require('passport');
var Student = require("../models/Student");

var studentController = {};

// Restrict access to root page
studentController.home = function(req, res) {
  res.render('<h1>Hello</h1>');
};

// Go to registration page
studentController.register = function(req, res) {
  res.render('auth/signup');
};

// Post registration
studentController.doRegister = function(req, res) {
  Student.register(new Student({ 
      email : req.body.email, 
      name: req.body.name, 
    }), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render('auth/signup', { user : user });
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/auth/signin');
    });
  });
};

// Go to login page
studentController.login = function(req, res) {
  res.render('auth/signin');
};

// Post login
studentController.doLogin = function(req, res) {
  passport.authenticate('studentLocal')(req, res, function () {
    //res.redirect('/');
    res.send('<h1>logged in</h1>')
  });
};

// logout
studentController.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

module.exports = studentController