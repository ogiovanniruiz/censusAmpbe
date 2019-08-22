var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')

var CanvasSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    swordForm: {}
  }
);

//Export model
module.exports = mongoose.model('Canvas', CanvasSchema);