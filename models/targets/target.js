var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TargetSchema = new Schema(
  {
    properties: {  targetName: {type: String}, 
                   status: {type: String, enum:["REGISTERED", "LOCKED", "DONE"]},
                   orgID: {type: String},
                   userID: {type: String},
                   campaignID: {type: Number},
                   params: {id: String, targetType: String, subParam: String},
                   queries:[{queryType: String, param: String, subParam: String}]
                },
    type: {type: String, default: "Feature"},
    geometry: {},
  }
);

//Export model
module.exports = mongoose.model('Target', TargetSchema);