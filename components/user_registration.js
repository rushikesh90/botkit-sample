const util = require('util')
const logger = require('../common/logger')
var MongoClient = require('mongodb').MongoClient

module.exports = function (controller) {
  /* Handle event caused by a user logging in with oauth */
  controller.on('oauth:success', async function (payload) {
    if (!payload.team_id) {
      logger.error('Error: received an oauth response without a team id: %j', payload)
      return
    }
    /* var url = process.env.MONGO_URI ;

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var myobj = payload;
      myobj._id = payload.team_id;
      var dbo = db.db(process.env.MONGO_DATABASE);
      var query = { _id: payload.team_id };
      if(dbo.collection((process.env.MONGO_SLACK_TEAMS_TABLE)).findOne({query}, {_id: 1}).size())
      {
        dbo.collection((process.env.MONGO_SLACK_TEAMS_TABLE)).updateOne(
          { _id: payload.team_id },
        { $set:  myobj },
          { upsert: true }, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
          
        });


        team.bot = {
          token: payload.bot.bot_access_token,
          user_id: payload.bot.bot_user_id,
          createdBy: payload.user_id,
          app_token: payload.access_token
        }

        var testbot = controller.spawn(team.bot)


        controller.trigger('onboard', [testbot, team])
      }
    })
    */

   controller.ready(() =>  {
   var testbot =  controller.spawn(payload.team_id)
   })

    controller.storage.teams.get(payload.team_id,async function (err, team) {
      if (err) {
        logger.error(`Error: could not load team from storage system. Team id = ${payload.team_id}`)
        logger.error(util.inspect(err))
      }

      var new_team = false
      if (!team) {
        team = {
          id: payload.team_id,
          createdBy: payload.user_id,
          name: payload.team
        }
        var new_team = true
      }
    
      team.bot = {
        token: payload.bot.bot_access_token,
        user_id: payload.bot.bot_user_id,
        createdBy: payload.user_id,
        app_token: payload.access_token
      }
    
      var testbot = await  controller.spawn(payload.team_id)

   // controller.trigger('onboard', testbot)

    controller.storage.teams.save(team, function (err) {
      if (err) {
        logger.error(util.inspect(err))
      } else {
        //if (new_team) {
          controller.trigger('onboard',  team)
       // }
      }
    })  

     /* testbot.api.auth.test({}, function (err, bot_auth) {
        if (err) {
          logger.error(util.inspect(err))
        } else {
          team.bot.name = bot_auth.user

          // add in info that is expected by Botkit
          testbot.identity = bot_auth

          testbot.identity.id = bot_auth.user_id
          testbot.identity.name = bot_auth.user

          testbot.team_info = team

          controller.storage.teams.save(team, function (err) {
            if (err) {
              logger.error(util.inspect(err))
            } else {
              if (new_team) {
                controller.trigger('onboard', [testbot, team])
              }
            }
          })
        }
      })*/
    })
  })
}
