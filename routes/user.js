const express = require('express');
let router = express.Router();
const passport = require('passport');
const async = require('async');

let User = require('../models/User');
let Cart = require('../models/Cart');
let passportConf = require('../config/passport');

router.get('/login', (req, res) => {
  if(req.user) return res.redirect('/');
  res.render('accounts/login', { message: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile', passportConf.isAuthenticated, (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser) {
      if(err) return next(err);
      res.render('accounts/profile', { user: foundUser });
    });
});

router.get('/signup', (req, res) => {
  if(req.user) return res.redirect('/');
  res.render('accounts/signup', { errors: req.flash('errors') });
});

router.post('/signup', (req, res, next) => {
  async.waterfall([
    function(callback) {
      let user = new User();
      user.profile.name = req.body.name;
      user.password = req.body.password;
      user.email = req.body.email;
      user.profile.picture = user.gravatar();
    
      User.findOne({ email: req.body.email }, (err, existingUser) => {
        if(existingUser) {
          req.flash('errors', `Account with ${req.body.email} already exists`);
          return res.redirect('/signup');
        } else {
          user.save((err) => {
            if(err) { return next(err); }
            callback(null, user);
          });
        }
      });
    },
    function(user) {
      let cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err) {
        if(err) return next(err);
        req.logIn(user, (err) => {
          if(err) { return next(err); }
          console.log(req.user);
          res.redirect('/profile');
        });
      });
    }
  ]);
});

router.get('/logout', (req, res, next) => {
  console.log('Logout fired');
  req.logout();
  res.redirect('/');
});

router.get('/edit-profile', (req, res, next) => {
  res.render('accounts/edit-profile', {message: req.flash('success')});
});

router.post('/edit-profile', (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if(err) return next(err);
    if(req.body.name) user.profile.name = req.body.name;
    if(req.body.address) user.address = req.body.address;

    user.save((err) => {
      if(err) return next(err);
      req.flash('success', 'Successfully edited profile.');
      return res.redirect('/edit-profile');
    });
  });
});

// by default facebook will not provide email. So add scope: 'email'
router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureFlash: '/login'
}));

module.exports = router;
