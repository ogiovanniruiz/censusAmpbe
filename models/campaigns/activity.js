var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var User = require('./user'); 
//var VoterInfo = require('./voterInfo.js');
//var Demographics = require('./demographics.js');
//var ContactHistory = require('./contactHistory.js')

var ActivitySchema = new Schema(
  {
    textActivity: [TextActivity.schema],
    canvasActivity: [CanvasActvity.schema],
    eventActivity: [EventActivity.schema],
    phoneActivity: [PhoneActivity.schema]
  }
);

//Export model
module.exports = mongoose.model('Activity', ActivitySchema);