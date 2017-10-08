const express = require('express');
let router = express.Router();

let Category = require('../models/Category');

router.get('/add-category', (req, res, next) => {
  res.render('admin/add-category', {message: req.flash('success')});
});

router.post('/add-category', (req, res, next) => {
  let category = new Category();
  category.name = req.body.category;

  category.save((err) => {
    if(err) { return next(err); }
    req.flash('success', 'Successfully added new categoy.');
    return res.redirect('/add-category');
  });
});

module.exports = router;