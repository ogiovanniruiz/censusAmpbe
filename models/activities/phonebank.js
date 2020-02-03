var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')

var PhonebankSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    phoneNums: [{number: {type: String}, userID: {type: String}, available: {type: Boolean, default: true}}],
    swordForm: {}
  }
);

//Export model
module.exports = mongoose.model('Phonebank', PhonebankSchema);