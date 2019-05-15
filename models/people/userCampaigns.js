var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserCampSchema = new Schema(
  {
    campaignID: {type: String},
    level: {type: String, enum: ['TRIAL', 'VOLUNTEER', 'ADMINISTRATOR'], default: "TRIAL"}
  }
);

//Export model
module.exports = mongoose.model('UserCamp', UserCampSchema);