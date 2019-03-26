module.exports = function(discordBot) {
    var Snoowrap = require("snoowrap");
    var config = require('./config');
    var r = new Snoowrap({
        userAgent: 'wat',
        clientId: config.reddit.client_id,
        clientSecret: config.reddit.client_secret,
        username: config.reddit.user_name,
        password: config.reddit.user_pass
    });
    discordBot.on("message", message => {
        if (message.channel.id == "350437018989363211" && message.attachments.first() && message.attachments.first().width) {
            console.log("submitting pixel art to reddit:", message.attachments.first().url);
            r.getSubreddit("OurWorldOfPixels").submitLink({
                "title": `[OWOP Bot|#pixel-art] from ${message.author.tag}${message.content ? ": " + message.cleanContent : ""}`.substr(0,300),
                "url": message.attachments.first().url
            });
        }
    });
    //todo facebook
}



