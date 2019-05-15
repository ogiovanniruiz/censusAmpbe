var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemographicSchema = new Schema(
  {
    age: {type: Number},
    gender: {type: String},
    ethnicity: [{type: String}], //NEEDS ACTUAL ETHINICTY OBJECT HERE
  }
);

//Export model
module.exports = mongoose.model('DemographicsInfo', DemographicSchema);