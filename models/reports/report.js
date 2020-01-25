var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IdResponses = require('../parcels/idResponses')

var ReportSchema = new Schema(
  {
    campaignID: {type: Number}, 
    orgID: {type: String},
    userID: {type: String},     
    idResponses: [IdResponses.schema], 
    personID: {type: String},
    activityType: {type: String, enum: ["PETITION", "CANVASS", "PHONEBANK", "TEXT"]},
    location: {type: { type: String },
               coordinates: { type: [Number] }},
    activityID: {type: String}, 
    date: {type: Date, default: Date.now},     
  }
);

//Export model
module.exports = mongoose.model('Report', ReportSchema);