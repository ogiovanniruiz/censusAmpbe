var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Address = require('./address')
var idHistory = require('./idHistory')
var CanvassContactHistory = require('../people/canvassContactHistory')

var ParcelSchema = new Schema(
  {
    type: {type: String},
    geometry: {},
    properties: {
                 membership: [{orgID: {type: String}, tags: {type: String}}], //NOT BEING USED
                 address: Address.schema, 
                 canvassContactHistory: [CanvassContactHistory.schema], //NOT BEING USED
                 owners: [],
                 parcelID: {type: String},
                 type: {type: String, enum: ["RESIDENTIAL", "NONRESIDENTIAL"]},
                 asset: idHistory.schema,
                 assessorCodes: {realUse: String, primary: String},
                 location: {type: { type: String },
                                    coordinates: { type: [Number] }}} 
  },
  { collection : 'parcels' }
);


//Export model
module.exports = mongoose.model('Parcel', ParcelSchema);