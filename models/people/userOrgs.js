var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserOrgSchema = new Schema(
  {
    orgID: {type: String},
    level: {type: String, enum: ['VOLUNTEER', 'LEAD', 'ADMINISTRATOR'], default: "VOLUNTEER"},
    phoneNumber: [{activityID: {type: String}, number: {type: String}}]
  }
);

//Export model
module.exports = mongoose.model('UserOrgs', UserOrgSchema);