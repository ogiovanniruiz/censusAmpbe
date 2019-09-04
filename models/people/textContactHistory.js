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
        textReceived: {type: Boolean, default: false},
        textConv: [{origin: {type: String, enum: ['VOLUNTEER', 'VOTER']}, msg: {type: String}}],
        idHistory: [idHistory.schema],
    }
);

//Export model
module.exports = mongoose.model('TextContactHistory', TextContactHistorySchema);