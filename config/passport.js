const passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
const async = require('async');
let secret = require('../config/secret');
let User = require('../models/User');
let Cart = require('../models/Cart');


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
    
    if(!user.comparePassword(password)) {
      return callback(null, false, req.flash('loginMessage', 'Oops! Wrong password'));
    }

    return callback(null, user);
  });
}));

passport.use(new FacebookStrategy(secret.facebook, (token, refreshToken, profile, callback) => {
  console.log("passport.js:46");
  console.log(token, refreshToken, profile);
  User.findOne({ facebook: profile.id }, (err, user) => {
    if(err) return callback(err);
    
    if(user) {
      return callback(null, user);
    } else {
      async.waterfall([
        function(next) {
          let newUser = new User();
          newUser.email = profile._json.email;
          newUser.facebook = profile.id;
          newUser.tokens.push({kind: 'facebook', token: token});
          newUser.profile.name = profile.displayName;
          newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          
          newUser.save((err) => {
            if(err) throw err;
            return next(null, newUser);
          });
        },
        function(newUser) {
          let cart = new Cart();
          cart.owner = newUser._id;
          cart.save(function(err) {
            if(err) return callback(err);
            return callback(null, newUser);
          });
        }
      ]);
    }
  });
}));


//--------Custom Function--------
exports.isAuthenticated = (req, res, callback) => {
  if(req.isAuthenticated()) {
    return callback();
  }
  res.redirect('/login');
}