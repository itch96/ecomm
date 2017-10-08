'use strict';
const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  crypto = require('crypto');

let Schema = mongoose.Schema;

// The user schema
let UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  
  facebook: String, 
  tokens: Array,
  
  profile: {
    name: { type: String },
    picture: { type: String }
  },
  address: { type: String },
  history: [{
    date: { type: Date, default: Date.now },
    paid: { type: Number },
    item: { type: Schema.Types.ObjectId, ref: 'Product' }
  }]
});

// Hash the password before saving
UserSchema.pre('save', function(next) {
  var user = this;
  if(!user.isModified('password')) return next();
  console.log("password passed before saving: " + user.password);
  bcrypt.genSalt(10, function(err, salt) {
    if(err) {console.log(err); return next(err);}
    bcrypt.hash(user.password, salt, function(err, hash) {
        if(err) {console.log(err); return next(err);}
        user.password = hash;
        next();
    });
  });
});

// Compare the password from the database
UserSchema.methods.comparePassword = function(password) {
  return (bcrypt.compareSync(password, this.password));
};

UserSchema.methods.gravatar = function(size) {
  if(!this.size) size = 200;
  if(!this.email) return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
}

module.exports = mongoose.model('User', UserSchema);
