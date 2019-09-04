var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')

var TextSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    initTextMsg: {type: String},
    quickResponses: [{type: String}],
    swordForm: {}
  }
);

//Export model
module.exports = mongoose.model('Text', TextSchema);