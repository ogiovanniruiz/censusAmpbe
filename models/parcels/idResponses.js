var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IdResponsesSchema = new Schema(
    { question: {type: String},
      responses: {},
      idType: {type: String, enum: ["Positive", "Neutral", "Negative", "NonResponse", "Refused"]},
    }, 
);

//Export model
module.exports = mongoose.model('IdResponses', IdResponsesSchema);