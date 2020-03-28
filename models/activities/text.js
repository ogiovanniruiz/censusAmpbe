var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')
var Person = require('../people/person.js')

var TextSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    phoneNums: [{number: {type: String}, userID: {type: String}, available: {type: Boolean, default: true}}],
    initTextMsg: {type: String},
    sendReceiverName: {type: Boolean, default: true},
    sendSenderName: {type: Boolean, default: true},
    quickResponses: [{type: String}],
    swordForm: {},
    swordRecordRawId: {type: String}
  }
);

//Export model
module.exports = mongoose.model('Text', TextSchema);
