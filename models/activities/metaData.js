var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaDataSchema = new Schema(
  {
    date: {type: Date, default: Date.now},
    name: {type: String},
    active: {type: Boolean, default: true},
    description: {type: String},
    targetIDs: [{type: String}],
    endDate: {type: String},
    campaignID: {type: Number},
    orgIDs: [{type: String}], //These are the orgs that have access.
    createdBy: {type: String},
    complete: {type: Boolean, default: false},
    nonResponses: [{type: String}],
    activityScriptIDs: [{type: String}]
  }
);

//Export model
module.exports = mongoose.model('MetaData', MetaDataSchema);