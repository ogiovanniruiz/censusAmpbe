var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CreationInfoSchema = new Schema(
    {
        createdBy: {type: String},
        date: {type: Date, default: Date.now},
        regType: {type: String, enum: ['SELF','MANUAL','MEMBERLIST', 'VOTERFILE']},
        location: {type: { type: String },
                   coordinates: { type: [Number] }},
    }
);

//Export model
module.exports = mongoose.model('CreationInfo', CreationInfoSchema);