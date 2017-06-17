require('dotenv').config();

var fs = require('fs');
/*var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/remoteapprentice.io/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/remoteapprentice.io/fullchain.pem')
}*/
var express = require('express');
var app = express();
var hookshot = require('hookshot');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.html');
});

app.use('/github-webhook', hookshot('refs/heads/master', 'git pull && pm2 restart app'));

app.listen(process.env.PORT || 3004, function(){
    console.log('Express server listening on  IP: 0.0.0.0 and port ' + (process.env.PORT || 3004));
});

//Bot code can be moved to seperate file later

var Botkit = require('botkit');


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({
    debug: true
});

controller.spawn({
    token: process.env.token
}).startRTM(function(err) {
    if (err) {
        throw new Error(err);
    }
});

controller.hears(['hello','hi'],['direct_message','direct_mention','mention'],function(bot,message) {
    bot.reply(message,"Hello.");
});

controller.hears(['attach'],['direct_message','direct_mention'],function(bot,message) {

    var attachments = [];
    var attachment = {
        title: 'This is an attachment',
        color: '#FFCC99',
        fields: [],
    };

    attachment.fields.push({
        label: 'Field',
        value: 'A longish value',
        short: false,
    });

    attachment.fields.push({
        label: 'Field',
        value: 'Value',
        short: true,
    });

    attachment.fields.push({
        label: 'Field',
        value: 'Value',
        short: true,
    });

    attachments.push(attachment);

    bot.reply(message,{
        text: 'See below...',
        attachments: attachments,
    },function(err,resp) {
        console.log(err,resp);
    });
});

controller.hears(['dm me'],['direct_message','direct_mention'],function(bot,message) {
    bot.startConversation(message,function(err,convo) {
        convo.say('Heard ya man for real');
    });

    bot.startPrivateConversation(message,function(err,dm) {
        dm.say('Private reply!');
    });

});

