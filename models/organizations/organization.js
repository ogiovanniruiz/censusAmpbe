var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../people/user')

var OrganizationSchema = new Schema(
  {
    name: {type: String},
    userIDs: [{type: String}],
    campaignIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    phoneNumbers: [{number: {type: String}, available: {type: Boolean, default: true}}],
    orgTags: [{type: String}],
    requests: [{type: String}],
  }
);

//Export model
module.exports = mongoose.model('Organization', OrganizationSchema);