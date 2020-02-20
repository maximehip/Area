const Discord = require('discord.js');
const config = require('../config/config.json');
const client = new Discord.Client();
const serverId = '612723435449090097'
var x = 0;
var user;

async function send_dm(name, phrase) {
    for (var x = 0; x < client.guilds.array().length; x++) { 
        for (var i = 0; i < client.guilds.array()[x].members.array().length; i++) {
        // console.log("message sent to this id: " + client.guilds.array()[x].members.array()[i].user.id + " -> " + client.guilds.array()[x].members.array()[i].user.username + "#" + client.guilds.array()[x].members.array()[i].user.discriminator)
            if (client.guilds.array()[x].members.array()[i].user.username.toLowerCase().trim().split(' ').join('') === name.toLowerCase().trim().split(' ').join('')) {
                user = client.users.get(client.guilds.array()[x].members.array()[i].user.id)
                  user.send(phrase)
                console.log("message sent to this id: " + client.guilds.array()[x].members.array()[i].user.id + " -> " + client.guilds.array()[x].members.array()[i].user.username + "#" + client.guilds.array()[x].members.array()[i].user.discriminator);
                return ("Message envoyé à " + name + ".");
            }
        }
    }
    console.log("Cannot find user: " + name)
    return ("Impossible d'envoyer le message à " + name + " vérifier le pseudo.")
}

/*client.on('ready', () => {
    if (x === 0) {
        console.log("Area Bot started");
        x++;
        send_dm("thepeps", "Salut boT, Tu veux un area ? je te le vend pour 15balles");
      }
})*/

module.exports.send_dm = send_dm;
client.login(config.tokenArea);