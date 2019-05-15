var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Script = require('../campaigns/script')
var UserCamp = require('./userCampaigns')

var UserSchema = new Schema(
  {
    userID: {type: String},
    password: {type: String},
    dev: {type: Boolean, default: false},
    loginEmail: {type: String},
    globalScripts: Script.schema,
    userCampaigns: [UserCamp.schema]
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);