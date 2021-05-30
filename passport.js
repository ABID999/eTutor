const  passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const Tutor = require('./models/Tutor')
const Student = require('./models/Student')


passport.use('tutorLocal',new LocalStrategy ({usernameField: 'email'},Tutor.authenticate()));
passport.use('studentLocal',new LocalStrategy ({usernameField: 'email'},Student.authenticate()));

// passport.serializeUser((obj, done) => {
//     if (obj instanceof Tutor) {
//         done(null, { id: obj.id, type: 'Tutor' });
//     } else {
//         done(null, { id: obj.id, type: 'Student' });
//     }
// });
  
// passport.deserializeUser((obj, done) => {
//     if (obj.type === 'Tutor') {
//         Tutor.get(obj.id).then((tutor) => done(null, tutor));
//     } else {
//         Student.get(obj.id).then((student) => done(null, student));
//     }
// });

passport.serializeUser(function(user, done) { 
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
if(user!=null)
    done(null,user);
});




module.exports = passport