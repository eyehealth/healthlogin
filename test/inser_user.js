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
});

var user2 = new User;
user2.username = 'stein';
user2.password = 'test';
user2.email = 'steinsogge@gmail.com';
user2.phoneNumber = '+4792447576';
user2.save(function(err){
    process.exit(0);
});

var user3 = new User;
user3.username = 'eivind';
user3.password = 'test';
user3.email = 'eivindingebrigtsen@gmail.com';
user3.phoneNumber = '+4793685138';
user3.save(function(err){
    process.exit(0);
});