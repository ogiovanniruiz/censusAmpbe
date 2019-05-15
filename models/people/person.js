var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user'); 
var VoterInfo = require('./voterInfo.js');
var Demographics = require('./demographics.js');
var ContactHistory = require('./contactHistory.js')
var CreationInfo = require('./creationInfo.js')

var PersonSchema = new Schema(
  {
    user: User.schema,
    parcelID: [{type: String}],
    firstName: {type: String},
    lastName: {type: String},
    phone: [{type: String}],
    emails: [{type: String}],
    voterInfo: VoterInfo.schema,
    demographics: Demographics.schema,
    contactHistory: ContactHistory.schema,
    creationInfo: CreationInfo.schema
  }
);


//Export model
module.exports = mongoose.model('Person', PersonSchema);