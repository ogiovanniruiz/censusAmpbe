var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RdrSchema = new Schema(
  {
    campaignID: {type: Number},
    activityID: {type: String},
    orgID: {type: String},
    exp: {type: Number}
  }
);

//Export model
module.exports = mongoose.model('Rdr', RdrSchema);