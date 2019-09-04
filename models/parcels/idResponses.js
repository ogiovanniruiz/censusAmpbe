var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IdResponsesSchema = new Schema(
    { question: {type: String},
      responses: {},
      idType: {type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "NONRESPONSE", "REFUSED"]},
    }, 
);

//Export model
module.exports = mongoose.model('IdResponses', IdResponsesSchema);