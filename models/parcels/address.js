var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressSchema = new Schema(
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
      location: {type: { type: String },
                 coordinates: { type: [Number] }},
      blockgroupID: {type: String}
      
    }
);

//Export model
module.exports = mongoose.model('Address', AddressSchema);
