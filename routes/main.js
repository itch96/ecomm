const express = require('express');
let router = express.Router();
let secret = require('../config/secret');
const async = require('async');
const stripe = require('stripe')(secret.stripeSecretKey);

let Product = require('../models/Product');
let Cart = require('../models/Cart');
let User = require('../models/User');

function paginate(req, res, callback, currentPage) {
  let perPage = 12;
  let page = req.params.page;

  Product
    .find()
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec((err, products) => {
      if(err) return callback(err);
      Product.count().exec((err, count) => {
        if(err) return callback(err);
        res.render('main/product-main', {
          products: products,
          pages: count / perPage,
          currentPage: currentPage
        });
      });
    });
}

// create a map b/w Product Schema and elasticsearch replica set.
Product.createMapping(function(err, mapping) {
  if(err) {
    console.log("Error creating mapping.");
    console.log(err);
  } else {
    console.log("Mapping created.");
    console.log(mapping);
  }
});

let stream = Product.synchronize(); // replicate all the data and put it in elasticsearch
let count = 0;

stream.on('data', function() {
  count ++;
});
stream.on('close', function() {
  console.log('Indexed ' + count + ' document.');
});
stream.on('error', function(err) {
  console.log(err);
});

router.post('/products/:product_id', (req, res, callback) => {
  Cart.findOne({ owner: req.user._id }, (err, cart) => {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseFloat(req.body.quantity  )
    });

    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
    cart.save((err) => {
      if(err) return callback(err);
      return res.redirect('/cart');
    });
  });
});

router.post('/remove', (req, res, callback) => {
  Cart.findOne({ owner: req.user._id }, (err, foundCart) => {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save((err, found) => {
      if(err) return callback(err);
      req.flash('remove', 'Successfully removed item from cart');
      res.redirect('/cart');
    });
  });
});

router.get('/cart', (req, res, callback) => {
  Cart.findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
      if(err) return callback(err);
      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove')
      });
    });
});

router.post('/search', (req, res, callback) => {
  res.redirect('/search?q=' + req.body.query);
});

router.get('/search', (req, res, callback) => {
  if(req.query.q) {
    Product.search({
      query_string: { query: req.query.q }
    }, (err, results) => {
      if(err) return callback(err);
      let data = results.hits.hits.map((hit) => {return hit;});
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
});

router.get('/', (req, res, callback) => {
  if(req.user) {
    paginate(req, res, callback, 1);
  } else {
    res.render('main/home');
  }
});

router.get('/page/:page', (req, res, callback) => {
  paginate(req, res, callback, req.params.page);
});

router.get('/about', (req, res) => {
  res.render('main/about');
});

router.get('/categories/:id', (req, res, callback) => {
  Product.find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if(err) return callback(err);
      res.render('main/category', { products: products });
    });
});

router.get('/products/:id', (req, res, callback) => {
  Product.findOne({ _id: req.params.id })
    .populate('category')
    .exec((err, product) => {
    if(err) return callback(err);
    res.render('main/product', {product: product});
  });
});

router.post('/payment', (req, res, callback) => {
  // just empty the cart and add the items in the user's history
  async.waterfall([
    function(callback) {
      Cart.findOne({ owner: req.user._id }, function(err, cart) {
        callback(err, cart);
      });
    },
    function(cart, callback) {
      User.findOne({ _id: req.user._id }, function(err, user) {
        if(user) {
          for(var i = 0; i < cart.items.length; i ++) {
            user.history.push({
              item: cart.items[i].item,
              paid: cart.items[i].price
            });
          }

          user.save(function(err, user) {
            if(err) return callback(err);
            callback(err, user);
          });
        }
      });
    },
    function(user) {
      Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated) {
        if(updated) {
          res.redirect('/profile');
        }
      });
    }
  ]);
});

module.exports = router;