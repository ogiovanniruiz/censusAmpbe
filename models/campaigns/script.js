var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = require('./question'); 

var ScriptSchema = new Schema(
  {
    title: {type: String},
    initMessage: {type: String},
    createdBy: {type: String}, //USER ID
    questions: [Question.schema],
    dateCreated: {type: Date, default: Date.now},
    campaignID: {type: Number}
  }
);

//Export model
module.exports = mongoose.model('Script', ScriptSchema);