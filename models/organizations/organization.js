var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrganizationSchema = new Schema(
  {
    name: {type: String},
    userIDs: [{type: String}],
    campaignIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    twilioAccount: {sid: {type: String}, authToken: {type: String}, app_sid: {type:String}},
    phoneNumbers: [{number: {type: String}, available: {type: Boolean, default: true}}],
    orgTags: [{type: String}],
    requests: [{type: String}],
  }
);

//Export model
module.exports = mongoose.model('Organization', OrganizationSchema);