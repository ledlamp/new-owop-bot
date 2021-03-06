module.exports = function (discordBot) {

    let commands = {
        "help": {
            description: "Guess what it does",
            usage: "b!help (<command>)",
            use: function (args, message) {
                if (args.length == 1 && args[0].toLowerCase() in commands) {
                    message.channel.send("**" + args[0].toLowerCase() + " usage:** `" + commands[args[0].toLowerCase()].usage + "`");
                } else {
                    var output = "**Command List**\n```markdown";
                    for (var i in commands) {
                        output += "\n[ " + i + " ](" + commands[i].description + ")";
                    }
                    output += "```";
                    message.channel.send(output);
                }
                return true;
            }
        },
        "eval": {
            whitelist: ["350303014944505866", "330499035419115522"], // admins, lamp2
            description: "Runs a snippet of javascript code on the server",
            usage: "b!eval <javascipt>",
            use: function (args, message) {
                if (args.length === 0) {
                    return false;
                } else {
                    var result;
                    try {
                        result = eval(args.join(" "));

                    } catch (e) {
                        message.channel.send(e.toString());
                        return true;
                    }
                    if (typeof result == "undefined") {
                        message.channel.send("`undefined`");
                    } else if (typeof result == "number") {
                        message.channel.send("`" + result + "`");
                    } else if (typeof result == "string") {
                        message.channel.send("`\"" + result + "\"`");
                    } else if (Array.isArray(result)) {
                        message.channel.send("`" + JSON.stringify(result) + "`");
                    } else {
                        message.channel.send("`" + result.toString() + "`");
                    }
                    return true;
                }
            }.bind(this)
        },
        "scale": {
            description: "Scale an image using nearest-neighbor.",
            usage: "b!scale (<url> | [image attachment]) (<scale>)",
            use: async function(args, message) {
                var request = require("request-promise-native"), sharp = require("sharp");
                var imageURL = (message.attachments.first() && message.attachments.first().url) || args[0];
                var scaleFactor = (message.attachments.first() ? args[0] : args[1]) || 2;
                if (scaleFactor > 10) return message.channel.send("Scale factor too large!");
                try {
                    var image = await request.get(imageURL, {encoding: null});
                } catch(e) {
                    console.error(e);
                    message.channel.send("Request: " + e.message);
                    return false;
                }
                try {
                    var s = sharp(image);
                    var {width, height} = await s.metadata();
                    s.resize(Math.round(width * scaleFactor), Math.round(height * scaleFactor), {kernel: "nearest"});
                    var rsz_image = await s.toBuffer();
                } catch(e) {
                    console.error(e);
                    message.channel.send("Sharp: " + e.message);
                    return false;
                }
                message.channel.send({files:[{
                    attachment: rsz_image,
                    name: `rsz_${scaleFactor}_${(message.attachments.first() && message.attachments.first().filename) || imageURL.split("/").pop()}`
                }]});
                return true;
            }
        }
    };

    discordBot.on("message", async function (message) {
        if (!message.author.bot) {
            if (message.content.startsWith("b!")) {
                if (message.guild.members.has("652830079763611668")) return;
                var content = message.content.slice(2).split(" ");
                let command = content[0].toLowerCase();
                if (command in commands) {
                    let canUse = true;
                    if (commands[command].whitelist) {
                        canUse = false;
                        for (let id of commands[command].whitelist) {
                            if (message.author.id == id || (message.member && message.member.roles.keyArray().includes(id))) {
                                canUse = true;
                                break;
                            }
                        }
                    }
                    if (canUse) {   
                        try {
                            var result = commands[command].use(content.slice(1), message);
                            if (result.then) result = await result;
                        } catch(e) {
                            message.channel.send("error");
                            console.error(e);
                        }
                        if (!result) {
                            message.channel.send("**:x:  " + command + " usage:** `" + commands[command].usage + "`");
                        }
                    } else {
                        message.channel.send(":x:  You don't have permission to use this command!");
                    }
                }
            }
        }
    });

}
