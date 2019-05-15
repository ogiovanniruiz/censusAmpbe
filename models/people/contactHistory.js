var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactHistorySchema = new Schema(
    {
        //NEEDS ACTUAL CONTACT HISTORY OBJECTS HERE
        textContactHistory: {type: String},
        phoneContactHistory: {type: String},
        canvasContactHistory: {type: String},
        eventContactHistory: {type: String},
    }
);

//Export model
module.exports = mongoose.model('ContactHistory', ContactHistorySchema);