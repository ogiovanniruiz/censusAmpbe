var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventActivity = require('./event.js')
var CanvasActvity = require('./canvas.js')

var ActivitySchema = new Schema(
  {
    //textActivity: [TextActivity.schema],
    canvasActivities: [CanvasActvity.schema],
    eventActivities: [EventActivity.schema],
    //phoneActivity: [PhoneActivity.schema]
  }
);

//Export model
module.exports = mongoose.model('Activity', ActivitySchema);