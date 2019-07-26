var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Target = require('../targets/target')

var CensusTractSchema = new Schema(
    {
      type: {type: String},
      geometry: {},
      properties: { name: String,
                    lrs: Number,
                    htc: Number,
                    geoid: String,
                    targetIDs: [{type: String}],
                    location: {type: { type: String },
                               coordinates: { type: [Number] }}}   
    }, 
    { collection : 'censustracts' }
);

//Export model
module.exports = mongoose.model('CensusTract', CensusTractSchema);