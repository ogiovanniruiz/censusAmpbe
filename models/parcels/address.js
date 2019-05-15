var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressSchema = new Schema(
    { 
      streetNum: {type: String},
      street: {type: String},
      prefix: {type: String},
      suffix: {type: String},
      city: {type: String},
      state: {type: String},
      county: {type: String},
      zip: {type: String},
    }
);


//Export model
module.exports = mongoose.model('Address', AddressSchema);