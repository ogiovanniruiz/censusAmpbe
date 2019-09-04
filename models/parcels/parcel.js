var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Address = require('./address')
var idHistory = require('./idHistory')
var CanvassContactHistory = require('../people/canvassContactHistory')

var ParcelSchema = new Schema(
    {
      type: {type: String},
      geometry: {},
      properties: {address: Address.schema, 
                   canvassContactHistory: [CanvassContactHistory.schema],
                   owners: [],
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