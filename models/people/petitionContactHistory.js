var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var idHistory = require('../parcels/idHistory')

var PetitionContactHistorySchema = new Schema(
    {
        campaignID: {type: Number},
        activityID: {type:String},
        orgID: {type: String},
        identified: {type: Boolean, default: false},
        idHistory: [idHistory.schema],
    }
);

//Export model
module.exports = mongoose.model('PetitionContactHistory', PetitionContactHistorySchema);