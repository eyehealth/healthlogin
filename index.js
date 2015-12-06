var express = require("express");
var bodyParser = require("body-parser");
var session = require('express-session');

var email = require("emailjs");
var oauthserver = require("oauth2-server");

var passwordless = require("passwordless");

var MongoStore = require("passwordless-mongostore");
var mongoose = require('mongoose');

var Nexmo = require("simple-nexmo");
var ejs = require("ejs");

var uid = require("uid");

var env = require('node-env-file');
    env(__dirname + '/.env');

var nexmo = new Nexmo({
    apiKey      : process.env.NEXMO_API_KEY,
    apiSecret   : process.env.NEXMO_API_SECRET,
    baseUrl     : process.env.NEXMO_BASE_URL,
    useSSL      : true,
    debug       : true
});

var uristring = 'mongodb://localhost/health';

var smtpServer  = email.server.connect({
    user        : process.env.SMTP_USER,
    password    : process.env.SMTP_PASS,
    host        : process.env.SMTP_HOST,
    ssl         : true
});

mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

var User = require("./lib/userModel");
passwordless.init(new MongoStore(uristring));

passwordless.addDelivery('email',
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
                return callback(err);
            }
            callback(message);
        });
    });

passwordless.addDelivery('sms',
    function(tokenToSend, uidToSend, recipient, callback) {
        //here to be changed sms headers as wished
        options.from = "Company"
        options.to = recipient;
        //type can be also changed to text
        options.type = 'unicode'
        options.text = "Your login token is: "+tokenToSend+" your uid is "+uidToSend
        nexmo.sendSMSMessage(options, function(err){
            if (err){
                console.log(err);
            }
            callback();
        })
    });


var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    genid: function(req){
        return uid
    },
    secret: 'healthApp',
    resave: true,
    saveUninitialized: false
}))
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/'}));

//app.oauth = oauthserver({
//    model: require("./lib/oautModel"),
//    grants: ['password'],
//    debug: true
//});
//
//app.all('/oauth/token', app.oauth.grant());
//
//app.get('/', app.oauth.authorise(), function (req, res) {
//    res.send('Secret area');
//});
//
//app.use(app.oauth.errorHandler());

app.get('/logged_in', passwordless.acceptToken(),
    function(req, res) {
        res.render('homepage');
    });

app.get('/login', function(req, res) {
    res.render('login');
});


app.post('/sendtoken', function(req,res){

    passwordless.requestToken(
        // Turn the email address into an user's ID
        function(user, delivery, callback, reqq) {
            console.log('requestToken', user, delivery);
            // usually you would want something like:
            User.find({email: user}, function(err, ret) {
                console.log(err, ret);
               if(ret)
                  callback(null, ret.id)
               else
                  callback(null, null)
          })
            

        }, function(reqqq, resss){
            resss.render('secondstep', {uid: reqqq.passwordless.uidToAuth});
        });


        
});

/*app.post('/sendtoken',
    passwordless.requestToken(
        function(user, delivery, callback, req) {
            console.log("delivery is" +delivery);
            console.log("user is "+user);
            console.log("req is "+req);
            if(delivery === 'email'){
                console.log('it is email')
                User.findOne({email: user}, function(err, data){
                    if(data){
                        callback(null, data._id);
                    }else{
                        callback(null, null)
                    }
                })
            }
            if (delivery === 'sms'){
                console.log('it is sms')
                User.findOne({phoneNumber: user}, function(err, data){
                    if(data){
                        callback(null, data._id);
                    }else{
                        callback(null, null)
                    }
                })
            }

        }),
    function(req, res) {
        console.log('something should be happening')
        console.log(req.passwordless.uidToAuth)
        res.render('secondstep', { uid: req.passwordless.uidToAuth });
    });*/


app.get('/restricted', passwordless.restricted(),
    function(req, res) {

    });
app.listen(3000);