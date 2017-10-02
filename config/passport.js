const passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

let User = require('../models/User');


//---------Serialize & Deserialize---------
passport.serializeUser((user, callback) => {
  callback(null, user._id);
});

passport.deserializeUser((id, callback) => {
  User.findById(id, function(err, user) {
    callback(err, user);
  });
});


//---------Middleware----------
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, callback) => {
  User.findOne({ email: email }, (err, user) => {
    if(err) { 
      return callback(err); 
    }
    
    if(!user) { 
      return callback(null, false, req.flash('loginMessage', 'No user has been found')); 
    }
    
    if(user.comparePassword(password)) {
      return callback(null, false, req.flash('loginMessage', 'Oops! Wrong password'));
    }

    return callback(null, user);
  });
}));


//--------Custom Function--------
exports.isAuthenticated = (req, res, callback) => {
  if(req.isAuthenticated()) {
    return callback();
  }
  res.redirect('/login');
}