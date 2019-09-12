var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoterHistorySchema = new Schema(
    {
     date: {type: String}, 
     method: {type: String}, 
     electionType: { type:String, enum:['PRIMARY', 'GENERAL', 'SPECIAL', 'LOCAL']}
    }
);

//Export model
module.exports = mongoose.model('VoterHistory', VoterHistorySchema);