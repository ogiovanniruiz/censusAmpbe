var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passwordResetSchema = new Schema(
  {
    email: {type: String},
  }
);

//Export model
module.exports = mongoose.model('passwordReset', passwordResetSchema);
