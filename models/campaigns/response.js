var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResponseSchema = new Schema(
  { 
    idType: {type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"]},
    response: {type: String},
    hasChildren: {type: Boolean, default: false},
    children: [{type: String}]
  }
);

//Export model
module.exports = mongoose.model('Response', ResponseSchema);