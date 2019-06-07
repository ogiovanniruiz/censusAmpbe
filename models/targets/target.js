var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TargetSchema = new Schema(
  {
    title: {type: String},
    targetType: {type: String, enum:["EMPTY", "APPLIED", "LOCKED", "DONE"]},
    params: {},
  }
);

//Export model
module.exports = mongoose.model('Target', TargetSchema);