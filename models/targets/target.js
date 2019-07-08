var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TargetSchema = new Schema(
  {
    title: {type: String}, 
    targetType: {type: String, enum:["APPLIED", "LOCKED", "DONE"]},
    orgID: {type: String},
    userID: {type: String},
    campaignID: {type: Number},
    params: {},
  }
);

//Export model
module.exports = mongoose.model('Target', TargetSchema);