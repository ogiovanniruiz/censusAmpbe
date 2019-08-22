var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user'); 
var VoterInfo = require('./voterInfo.js');
var Demographics = require('./demographics.js');
var CanvassContactHistory = require('./canvassContactHistory.js')
var CreationInfo = require('./creationInfo.js')
var Address = require('../parcels/address')

var PersonSchema = new Schema(
  {
    user: User.schema,
    firstName: {type: String},
    lastName: {type: String},
    middleName: {type: String},
    phones: [{type: String}],
    emails: [{type: String}],
    address: Address.schema,
    voterInfo: VoterInfo.schema,
    demographics: Demographics.schema,
    canvassContactHistory: [CanvassContactHistory.schema],
    
    creationInfo: CreationInfo.schema
  }
);


//Export model
module.exports = mongoose.model('Person', PersonSchema);