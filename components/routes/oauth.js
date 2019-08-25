const util = require('util')
const logger = require('../../common/logger')
const config = require('config')

module.exports = function ( controller) {

  controller.webserver.get(config.get('API_PREFIX') + '/install', (req, res) => {
    // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    res.redirect(controller.adapter.getInstallLink());
});

controller.webserver.get(config.get('API_PREFIX') + '/oauth', async (req, res) => {
    try {


        const results = await controller.adapter.validateOauthCode(req.query.code);

      //  console.log('FULL OAUTH DETAILS', results);

        controller.trigger('oauth:success', results);

        // Store token by team in bot state.
       /* tokenCache[results.team_id] = results.bot.bot_access_token;

        // Capture team to bot id
        userCache[results.team_id] =  results.bot.bot_user_id;
*/
res.cookie('team_id', results.team_id)
res.cookie('bot_user_id', results.bot.bot_user_id)
res.redirect(config.get('API_PREFIX') + '/login_success.html')


    } catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
    }
});
  
return 

}
