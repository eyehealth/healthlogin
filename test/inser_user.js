var mongoose = require("mongoose")

var User = require("../lib/userModel");


mongoose.connect("mongodb://localhost/health")

var user = new User;

user.username = 'stef';
user.password = 'test';
user.email = 'stefkev@gmail.com';
user.phoneNumber = '+38163521651';
user.save(function(err){
    process.exit(0);
})