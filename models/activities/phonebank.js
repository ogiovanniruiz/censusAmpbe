var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')

var PhonebankSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    phoneNum: {type: String},
    swordForm: {}
  }
);

//Export model
module.exports = mongoose.model('Phonebank', PhonebankSchema);