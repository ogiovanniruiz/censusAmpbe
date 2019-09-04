var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResidentAddressSchema = new Schema(
    { 
      streetNum: {type: String, trim: true},
      unit: {type: String},
      street: {type: String},
      prefix: {type: String},
      suffix: {type: String},
      city: {type: String, trim: true},
      state: {type: String},
      county: {type: String},
      zip: {type: String, trim: true},
    }
);

//Export model
module.exports = mongoose.model('ResidentAddress', ResidentAddressSchema);