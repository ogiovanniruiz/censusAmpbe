var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')

var TextSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    phoneNum: {type: String},
    initTextMsg: {type: String},
    sendReceiverName: {type: Boolean, default: true},
    sendSenderName: {type: Boolean, default: true},
    quickResponses: [{type: String}],
    swordForm: {}
  }
);

//Export model
module.exports = mongoose.model('Text', TextSchema);