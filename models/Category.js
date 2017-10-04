const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CategorySchema = new Schema({
  name: { type: String, unique: true }
});

module.exports = mongoose.model('Category', CategorySchema);
