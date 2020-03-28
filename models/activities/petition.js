var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MetaData = require('./metaData.js')

var PetitionSchema = new Schema(
  {
    activityMetaData: MetaData.schema,
    url: {type: String},
    swordForm: {},
    swordRecordRawId: {type: String}
  }
);

//Export model
module.exports = mongoose.model('Petition', PetitionSchema);
