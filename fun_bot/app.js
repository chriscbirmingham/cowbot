const Discord = require("discord.js");
const client = new Discord.Client();
var roboSpeak = true;

client.on("ready", () => {
  console.log("honk");
});

client.on("message", (message) => {
  if (message.content.startsWith("ping")) {
    message.channel.send("pong!");
  }

  if(roboSpeak){
	  if (!message.content.startsWith("`") || !message.content.substring(message.content.length - 1) === "`"){
	  	message.edit("`" + message.content + "`");
	  }
	}

  //below here are commands the "bot" isn't allowed to use.
  if (message.author === client.user) return;

  if (message.content === "Activate voice modulator"){
  	roboSpeak = true;
  }
  });

client.login("its a secret");
