global.Promise = require('bluebird')
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');
const config = require('config')
var MongoClient = require('mongodb').MongoClient



// Import a platform-specific adapter for slack.

const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();



if (!process.env.clientId || !process.env.clientSecret || !process.env.MONGO_URI || !process.env.clientSigningSecret) {
  usage_tip()
  process.exit(1)
}

/*
let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage =  require('botkit-storage-mongo')({
        mongoUri: process.env.MONGO_URI,
        tables: ['tasks']
      });
}
*/

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}


const adapter = new SlackAdapter({


    // parameters used to secure webhook endpoint

    clientSigningSecret: process.env.clientSigningSecret,  

    // credentials used to set up oauth for multi-team apps
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    scopes: ['bot', 'chat:write:bot'], 
    redirectUri: process.env.redirectUri,
 
    // functions required for retrieving team-specific info
    // for use in multi-team apps
    getTokenForTeam: getTokenForTeam,
    getBotUserByTeam: getBotUserByTeam,
});

// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware());

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware());


const controller = new Botkit({
    webhook_uri: '/api/messages',

    adapter: adapter,

    storage
});

if (process.env.cms_uri) {
    controller.usePlugin(new BotkitCMSHelper({
        uri: process.env.cms_uri,
        token: process.env.cms_token,
    }));
}




// Set up an Express-powered webserver to expose oauth and webhook endpoints
controller.webserver = require(__dirname + '/components/express_webserver.js')(controller)

controller.webserver.get(config.get('API_PREFIX') + '/health', function (req, res) {
  res.json({ok:true});
});

controller.webserver.get(config.get('API_PREFIX') + '/', function (req, res) {
  res.render('index', {
    domain: req.get('host'),
    protocol: req.protocol,
    glitch_domain: process.env.PROJECT_DOMAIN,
    layout: 'layouts/default'
  })
})


// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller)

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller)

var normalizedPath = require('path').join(__dirname, 'skills')
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  require('./skills/' + file)(controller)
})

function usage_tip() {
  console.log('~~~~~~~~~~')
  console.log('Botkit Starter Kit')
  console.log('Execute your bot application like this:')
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 MONGO_URI=<MONGODB URI> clientSigningSecret=<CLIENT SIGNING SECRET> node bot.js')
  console.log('Get Slack app credentials here: https://api.slack.com/apps')
  console.log('~~~~~~~~~~')
}

var url = process.env.MONGO_URI ;


async function getTokenForTeam(teamId) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(process.env.MONGO_DATABASE);
        var query = { _id: teamId };
        return dbo.collection(process.env.MONGO_SLACK_TEAMS_TABLE).find(query,{ _id: 0, access_token: 1}).toString(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();
        });
    })
}

async function getBotUserByTeam(teamId) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(process.env.MONGO_DATABASE);
        var query = { _id: teamId };
        return dbo.collection(process.env.MONGO_SLACK_TEAMS_TABLE).find(query,{ _id: 0, bot: 1}).toString(function(err, result) {
          if (err) throw err;
          console.log(result);
          db.close();
        });
    })
}

/*

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
/*    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

});



controller.webserver.get('/', (req, res) => {

    res.send(`This app is running Botkit ${ controller.version }.`);

});


controller.webserver.get(config.get('API_PREFIX') + '/install', (req, res) => {
    // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    res.redirect(controller.adapter.getInstallLink());
});

controller.webserver.get(config.get('API_PREFIX') + '/install/auth', async (req, res) => {
    try {
        const results = await controller.adapter.validateOauthCode(req.query.code);

        console.log('FULL OAUTH DETAILS', results);

        // Store token by team in bot state.
        tokenCache[results.team_id] = results.bot.bot_access_token;

        // Capture team to bot id
        userCache[results.team_id] =  results.bot.bot_user_id;

        res.json('Success! Bot installed.');

    } catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
    }
});



*/