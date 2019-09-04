var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user'); 
var VoterInfo = require('./voterInfo.js');
var Demographics = require('./demographics.js');
var CanvassContactHistory = require('./canvassContactHistory.js')
var CreationInfo = require('./creationInfo.js')
var ResidentAddress = require('./residentAddress.js')
var TextContactHistory = require('./textContactHistory.js')

var PersonSchema = new Schema(
  {
    user: User.schema,
    firstName: {type: String},
    lastName: {type: String},
    middleName: {type: String},
    phones: [{type: String}],
    emails: [{type: String}],
    address: ResidentAddress.schema,
    voterInfo: VoterInfo.schema,
    demographics: Demographics.schema,
    canvassContactHistory: [CanvassContactHistory.schema],
    textContactHistory: [TextContactHistory.schema],
    creationInfo: CreationInfo.schema
  }
);


//Export model
module.exports = mongoose.model('Person', PersonSchema);