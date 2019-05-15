var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResponseSchema = new Schema(
  { 
    idType: {type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"]},
    responses: {type: String},
  }
);

//Export model
module.exports = mongoose.model('Response', ResponseSchema);