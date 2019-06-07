var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Script = require('./script');
var Target = require('../targets/target') 
var User = require('../people/user')

autoIncrement = require('mongoose-auto-increment');

var CampaignSchema = new Schema(
  {
    campaignID: {type: Number},
    name: {type: String},
    userIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    requests: [User.schema],
    //activities: [Activity.schema],
    //campaignScripts: [Script.schema],
    targets: [Target.schema],
    //nonResponses: [NonResponse.schema]
  }
);

autoIncrement.initialize(mongoose.connection);
CampaignSchema.plugin(autoIncrement.plugin, {model:'Campaign', field: 'campaignID'});

//Export model
module.exports = mongoose.model('Campaign', CampaignSchema);