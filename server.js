'use strict';

//-------------LIBRARIES------------
const path = require('path');
const express = require('express');
let app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const morgan = require('morgan');
const mongoose = require('mongoose');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const MongoStore = require('connect-mongo')(session);// store session on server-side
const passport = require('passport');


//-----------FILES------------
let User = require(path.join(__dirname, 'models', 'User'));
let Category = require(path.join(__dirname, 'models', 'Category'));
let cartLength = require(path.join(__dirname, 'middlewares', 'middlewares'));
let mainRoutes = require(path.join(__dirname, 'routes', 'main'));
let userRoutes = require(path.join(__dirname, 'routes', 'user'));
let adminRoutes = require(path.join(__dirname, 'routes', 'admin'));
let apiRoutes = require(path.join(__dirname, 'routes', 'api'));
let secret = require(path.join(__dirname, 'config', 'secret'));

//------------DB_CONFIGURATION--------------
mongoose.connect(secret.database, (err) => {
  if(err) { console.log(err); }
  else { console.log("Connected to DB."); }
});


//----------MIDDLEWARES-----------
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.database, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, callback) => {
  res.locals.user = req.user;
  callback();
}); // now every route will have the user variable in ejs template
app.use(cartLength);
app.use((req, res, callback) => {
  Category.find({}, (err, categories) => {
    if(err) { return callback(err); }
    res.locals.categories = categories;
    callback();
  });
}); // now every route will have the categories varialble in ejs template
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');


//-------------ROUTES-------------
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);


//--------------LISTENING--------------
app.listen(secret.port, (err) => {
  if(err) {console.log(err);}
  else {console.log(`Server running on port ${secret.port}`);}
});