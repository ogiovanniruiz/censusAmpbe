var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressSchema = new Schema(
    { 
      streetNum: {type: String, trim: true},
      street: {type: String},
      prefix: {type: String},
      suffix: {type: String},
      city: {type: String},
      state: {type: String},
      county: {type: String},
      zip: {type: String, trim: true},
    }
);

//Export model
module.exports = mongoose.model('Address', AddressSchema);