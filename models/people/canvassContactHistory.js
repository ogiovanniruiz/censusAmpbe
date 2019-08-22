var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var idHistory = require('../parcels/idHistory')

var CanvassContactHistorySchema = new Schema(
    {
        campaignID: {type: Number},
        activityID: {type:String},
        idHistory: [idHistory.schema],
    }
);

//Export model
module.exports = mongoose.model('CanvassContactHistory', CanvassContactHistorySchema);