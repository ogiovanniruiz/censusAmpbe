var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PreferredMethodContactSchema = new Schema(
    {
        orgID: {type: String},
        optInProof: {type: String}, //activityID or SELF REPORT
        method: {type: String, enum: ['CANVASS', 'PHONE', 'TEXT', 'EMAIL']}
    }
);

//Export model
module.exports = mongoose.model('PreferredMethodContact', PreferredMethodContactSchema);