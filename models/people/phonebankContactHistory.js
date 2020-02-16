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
        nonResponse: {type: Boolean, deault: false},
        idHistory: [idHistory.schema],
        reserved: {type: String}
    }
);

//Export model
module.exports = mongoose.model('PhonebankContactHistory', PhonebankContactHistorySchema);