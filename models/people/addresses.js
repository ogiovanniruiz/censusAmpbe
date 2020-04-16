var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressesSchema = new Schema(
    {
        streetNum: {type: String},
        suffix: {type: String},
        prefix: {type: String},
        city: {type: String},
        zip: {type: String},
        street: {type: String},
        state: {type: String},
        accuracyType: {type: String},
        location: {type: { type: String },
                    coordinates: { type: [Number] }},
    }
);

//Export model
module.exports = mongoose.model('Addresses', AddressesSchema);
