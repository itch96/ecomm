const express = require('express');
let router = express.Router();
const async = require('async');
const faker = require('faker');

let Category = require('../models/Category');
let Product = require('../models/Product');

router.get('/:name', (req, res, callback) => {
  async.waterfall([
    function(callback) {
      Category.findOne({ name: req.params.name }, function(err, category) {
        if(err) return next(err);
        callback(null, category);
      });
    },
    function(category, callback) {
      for(let i = 0; i < 30; i ++) {
        let product = new Product();
        product.category = category._id;
        product.name = faker.commerce.product();
        product.price = faker.commerce.price();
        product.image = faker.image.image();

        product.save();
      }
    }
  ]);

  res.json({message: 'Success'})
});

module.exports = router;