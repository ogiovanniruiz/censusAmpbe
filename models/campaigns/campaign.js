var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Script = require('./script');
var Target = require('../targets/target') 
var Activity = require('../activities/activity')
var EventActivity = require('../activities/event.js')
var CanvasActvity = require('../activities/canvas.js')

autoIncrement = require('mongoose-auto-increment');

var CampaignSchema = new Schema(
  {
    campaignID: {type: Number},
    name: {type: String},
    orgIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    requests: [{type: String}],
    //activities: Activity.schema,
    //textActivity: [TextActivity.schema],
    canvasActivities: [CanvasActvity.schema],
    eventActivities: [EventActivity.schema],
    //phoneActivity: [PhoneActivity.schema]
    targets: [Target.schema],
    //nonResponses: [NonResponse.schema]
  }
);

autoIncrement.initialize(mongoose.connection);
CampaignSchema.plugin(autoIncrement.plugin, {model:'Campaign', field: 'campaignID'});

//Export model
module.exports = mongoose.model('Campaign', CampaignSchema);