var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var idHistory = require('../parcels/idHistory')

var PhonebankContactHistorySchema = new Schema(
    {
        campaignID: {type: Number},
        activityID: {type: String},
        orgID: {type: String},
        identified: {type: Boolean, default: false},
        houseHoldComplete: {type: Boolean, default: false},
        refused: {type: Boolean, default: false},
        nonResponse: {type: Boolean, default: false},
        idHistory: [idHistory.schema],
        lockedBy: {type: String},
        impression: {type: Boolean, default: false}
    }
);

//Export model
module.exports = mongoose.model('PhonebankContactHistory', PhonebankContactHistorySchema);