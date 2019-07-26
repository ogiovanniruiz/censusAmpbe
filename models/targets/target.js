var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TargetSchema = new Schema(
  {
    properties: {  targetName: {type: String}, 
                   status: {type: String, enum:["REGISTERED", "LOCKED", "DONE"]},
                   orgID: {type: String},
                   userID: {type: String},
                   campaignID: {type: Number},
                   params: {id: String, targetType: String},
                   date: {type: String},
                   time: {type: String}
                },
    type: {type: String},
    geometry: {},
  }
);

//Export model
module.exports = mongoose.model('Target', TargetSchema);