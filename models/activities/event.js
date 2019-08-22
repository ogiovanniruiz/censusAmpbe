var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')
var Address = require('../parcels/address')

var EventSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    address: Address.schema,
    time: {type: String},
    blockGroupID: {type: String},
    orgCreatorName: {type: String},
    location: {},
    assetID: {type: String},
    locationName: {type: String},
    swordForm: {}
  }
);

//Export model
module.exports = mongoose.model('Event', EventSchema);