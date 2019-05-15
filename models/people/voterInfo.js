var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoterHistory = require(('./voterHistory'))

var VoterInfoSchema = new Schema(
  {
    voterID: {type: String},
    party: {type: String},
    regHistory: [{date: String, party: String}],
    voterHistory:  [VoterHistory.schema],
  }
);

//Export model
module.exports = mongoose.model('VoterInfo', VoterInfoSchema);