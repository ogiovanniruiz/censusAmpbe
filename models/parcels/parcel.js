var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Address = require('./address')
//var Unit = require('')
var idHistory = require('./idHistory')
//var Location = require('')

var ParcelSchema = new Schema(
    {
        type: {type: String},
      geometry: {},
      properties: {address: Address.schema, 
                  //units: [Unit.schema], 
                  owners: [],
                  type: {type: String, enum: ["RESIDENTIAL", "NONRESIDENTIAL"]},
                  asset: idHistory.schema,
                  location: {type: { type: String },
                              coordinates: { type: [Number] }}}   
    }, 
    { collection : 'parcels' }
);


//Export model
module.exports = mongoose.model('Parcel', ParcelSchema);