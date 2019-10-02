var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PreferredMethodContactSchema = new Schema(
    {
        orgID: {type: String},
        optInProof: {type: String}, //idHistory or SELF REPORT
        method: {enum: ['CANVASS', 'PHONEBANK', 'TEXT']}

    }
);

//Export model
module.exports = mongoose.model('PreferredMethodContact', PreferredMethodContactSchema);