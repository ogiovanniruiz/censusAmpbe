var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IdResponses = require('./idResponses')

var IdHistorySchema = new Schema(
    { date: {type: Date, default: Date.now},
      scriptID: {type: String},
      comment: {type: String},
      idBy: {type: String},
      idResponses: [IdResponses.schema],
      locationIdentified: {type: { type: String },
                           coordinates: { type: [Number] }},
    }, 
);

//Export model
module.exports = mongoose.model('IdHistory', IdHistorySchema);