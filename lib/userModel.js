var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//
// Schemas definitions
//
var UserSchema = new Schema({
    username: String,
    password: String,
    email: String,
    phoneNumber: String
});

module.exports = mongoose.model('user', UserSchema);


