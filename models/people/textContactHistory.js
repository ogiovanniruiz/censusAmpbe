var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var idHistory = require('../parcels/idHistory')

var TextContactHistorySchema = new Schema(
    {
        campaignID: {type: Number},
        activityID: {type:String},
        orgID: {type: String},
        lockedBy: {type: String},
        textSent: {type: Boolean, default: false},
        outgoingPhoneNum: {type: String},
        identified: {type: Boolean, default: false},
        refused: {type: Boolean, default: false},
        nonResponse: {type: Boolean, deault: false},
        complete: {type: Boolean, default: false},
        textReceived: {type: Boolean, default: false},
        textConv: [{origin: {type: String, enum: ['VOLUNTEER', 'VOTER']}, msg: {type: String}, error: {type: String, default:"NONE"}}],
        idHistory: [idHistory.schema],
    }
);

//Export model
module.exports = mongoose.model('TextContactHistory', TextContactHistorySchema);