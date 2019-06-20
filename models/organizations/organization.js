var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../people/user')

var OrganizationSchema = new Schema(
  {
    orgID: {type: Number},
    name: {type: String},
    userIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    requests: [{type: String}],
  }
);

//Export model
module.exports = mongoose.model('Organization', OrganizationSchema);