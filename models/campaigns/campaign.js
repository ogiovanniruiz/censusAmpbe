var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Script = require('./script'); 

var CampaignSchema = new Schema(
  {
    name: {type: String},
    userIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean},
    requests: [{type: String}],
    //activities: [Activity.schema], SHOULD THIS BE AN ARRAY???
    //campaignScripts: [Script.schema],
    //queries: [Query.schema],
    //nonResponses: [NonResponse.schema] //NEEDS REVIEW????
  }
);

//Export model
module.exports = mongoose.model('Campaign', CampaignSchema);