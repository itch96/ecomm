const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const mongoosastic = require('mongoosastic');

let ProductSchema = new Schema({
  category: { type: Schema.ObjectId, ref: 'Category' },
  name: { type: String },
  price: { type: Number },
  image: { type: String }
});

// elasticsearch is running on 127.0.0.1:9200
ProductSchema.plugin(mongoosastic, {
  hosts: ['localhost:9200']
});

module.exports = mongoose.model('Product', ProductSchema);
