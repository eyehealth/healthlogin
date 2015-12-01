var express = require("express");
var passwordless = require("passwordless");
var bodyParser = require("body-parser");
var email = require("emailjs");
var oauthServer = require("oauth2-server");
var mongoose = require('mongoose');

var uristring = 'mongodb://localhost/health';


var smtpUser = "";
var smtpPassword = "";
var smtpHost = "";

var smtpServer  = email.server.connect({
    user:    smtpUser,
    password: smtpPassword,
    host:    smtpHost,
    ssl:     true
});

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

passwordless.init(new MongoStore(uristring))

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        var host = 'localhost:3000';
        smtpServer.send({
            text:    'Hello!\nAccess your account here: http://'
            + host + '?token=' + tokenToSend + '&uid='
            + encodeURIComponent(uidToSend),
            from:    yourEmail,
            to:      recipient,
            subject: 'Token for ' + host
        }, function(err, message) {
            if(err) {
                console.log(err);
            }
            callback(err);
        });
    });


var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.oauth = oauthserver({
    model: require("./lib/oautModel"),
    grants: ['password'],
    debug: true
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
    res.send('Secret area');
});

app.use(app.oauth.errorHandler());

app.get('/logged_in', passwordless.acceptToken(),
    function(req, res) {
        res.render('homepage');
    });

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/sendtoken',
    passwordless.requestToken(
        function(user, delivery, callback, req) {
            User.find({email: user}, function(ret){
                if(ret){
                    callback(null, ret.id);
                }else{
                    callback(null, null)
                }
            })
        }),
    function(req, res) {

        res.render('sent');
    });

router.get('/restricted', passwordless.restricted(),
    function(req, res) {
        
    });

app.listen(3000);


