var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Script = require('../campaigns/script')
var UserOrg = require('./userOrgs')

var UserSchema = new Schema(
  {
    password: {type: String},
    dev: {type: Boolean, default: false},
    loginEmail: {type: String},
    globalScripts: Script.schema,
    userOrgs: [UserOrg.schema],
    userAgreements: [{version: String, date: {type: Date, default: Date.now}}],
    assetMapLvl: {type: String, enum: ['TRIAL', 'VOLUNTEER', 'ADMINISTRATOR'], default: "TRIAL"}
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);