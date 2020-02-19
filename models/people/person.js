var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user'); 
var VoterInfo = require('./voterInfo.js');
var Demographics = require('./demographics.js');
var CanvassContactHistory = require('./canvassContactHistory.js')
var CreationInfo = require('./creationInfo.js')
var Address = require('../parcels/address.js')
var TextContactHistory = require('./textContactHistory.js')
var PhonebankContactHistory = require('./phonebankContactHistory.js')
var PreferredMethodContact = require('./preferredMethodContact.js')
var PetitionContactHistory = require('./petitionContactHistory.js')

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
    membership: [{orgID: {type: String}, tags: [{type: String}]}],
    canvassContactHistory: [CanvassContactHistory.schema],
    textContactHistory: [TextContactHistory.schema],
    phonebankContactHistory: [PhonebankContactHistory.schema],
    petitionContactHistory: [PetitionContactHistory.schema],
    creationInfo: CreationInfo.schema,
    preferredMethodContact: [PreferredMethodContact.schema],
    clientID: {type: String}
  }//,{ collection : 'voterfile' }
);


//Export model
module.exports = mongoose.model('Person', PersonSchema);