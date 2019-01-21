class Poll {
  constructor(can){ //TODO: implement variable timers
    this.candidates = can.slice(0);
    console.log(typeof this.candidates);
    this.voteTotals = [];
    this.countedUsers = new Set();
    for(var i = 0; i < this.candidates.length; i++){
      this.voteTotals[i] = 0;
    }
  }

  addVote(userID, candidateIndex){
    var beforeSize = this.countedUsers.size;
    var voteNum = candidateIndex - 1;
    console.log("user id is " + userID);
    this.countedUsers.add(userID);
    if(this.countedUsers.size == beforeSize){
      console.log("vote failed");
      return false;
    }


    this.voteTotals[voteNum] = this.voteTotals[voteNum] + 1;
    console.log(this.voteTotals[voteNum]);
    console.log("logged vote for " + this.candidates[voteNum]);

    return true;
  }

  getTotalOptions(){
    return this.voteTotals.length;
  }

  getCurrentStats(){
    var currentStats = [];
    for(var i = 0; i < this.voteTotals.length; i++){
      currentStats.push([this.voteTotals[i], this.candidates[i]]);
    }

    return currentStats;
  }

  getWinners(){
    var maxVotes = -1;
    var totalVotes = 0;
    for(var i = 0; i < this.voteTotals.length; i++){
      if(this.voteTotals[i] > maxVotes)
        maxVotes = this.voteTotals[i];
      totalVotes += this.voteTotals[i];
    }

    var winners = [];
    if(totalVotes != 0)
      winners.push((maxVotes/totalVotes) * 100);
    else
      winners.push(100);

    for(var i = 0; i < this.voteTotals.length; i++){
      if(this.voteTotals[i] == maxVotes)
        winners.push(this.candidates[i]);
    }

    return winners;
  }
}

const Discord = require('discord.js');
const client = new Discord.Client();
const cfig = require('./settings.json');
const sauce = require('./sauce.json');
var random = require("random-js")();
var fs = require('fs');

var erisLib = require('eris');
const eris = new erisLib.Client(cfig.token);
var ongoingPoll = false;
var currentPoll;
var pollTimer = 0;
var ratsOnCooldown = false;

var prefix = "~"

client.on('ready',() => {
  console.log('helno world');
  currentPoll = null;
  ongoingPoll = false;
  client.user.setActivity('god');
});

const Enmap = require('enmap');
const EnmapLevel = require('enmap-level');
const settings = new Enmap({provider: new EnmapLevel({name: "settings"})});

const defaultSettings = {
  sillyActive: true,
  rouletteActive: false
}

client.on("guildCreate", guild => {
  settings.set(guild.id, defaultSettings);
});

client.on("guildDelete", guild => {
  settings.delete(guild.id);
});

setInterval(function() {
  var today = new Date();
  if(today.getMinutes() == 15 || today.getMinutes() == 30 || today.getMinutes() == 45 || today.getMinutes() == 0){
    console.log(today.getHours() + ":" + today.getMinutes() + " everything is okay!");
  } else {
    return;
  }
}, 60000);

client.on('message', message => {
  if (message.author === client.user) return;
  if(message.guild == null)
    return;

  var member = message.guild.members.get(message.author.id);
  var author = message.author;
  var name = author.username;
  var id = message.author.id;
  var isValid = false;
  const guildConf = settings.get(message.guild.id);

  if(guildConf == null){
    settings.set(message.guild.id, defaultSettings);
  }

  if(message.channel.permissionsFor(message.member) == null)
    return;

  if(message.channel.permissionsFor(message.member).has("ADMINISTRATOR")){
    if(message.content === (prefix + "enable roulette")){
      guildConf.rouletteActive = true;
      message.channel.send("The gun's hot! Who wants to die?");
    }
  
    if(message.content === (prefix + "disable roulette")){
      guildConf.rouletteActive = false;
      message.channel.send("Unloading the revolver.");
    }
  
    if(message.content === (prefix + "enable silly")){
      guildConf.sillyActive = true;
      message.channel.send("", { file: "https://pics.onsizzle.com/message-to-de-west-get-sillay-10343203.png" });
    }
  
   if(message.content === (prefix + "disable silly")){
      guildConf.sillyActive = false;
      message.channel.send("no more silly :'(");
    }
  }

  if(message.content === (prefix + 'help')){
    message.channel.send(sauce.helptext);
  }

  if(message.content.startsWith(prefix + 'roll ')){
    var theMeat = message.content.substring(5);
    // console.log(diceString);
    var theSinew = (theMeat.split('+'));
    var diceString = theSinew[0];

    var parseString = diceString.split('d');
    console.log(parseString);
    if(parseString.length < 2){
      console.log("format error");
      messsage.channel.send("you didn't specify a correct die size");
      return;
    }
    console.log("no format error");
    // console.log(parseString[0] + " " + parseString[1]);
    if(isNaN(parseString[0]) || isNaN(parseString[1])){
      message.channel.send("that's not a number!");
      return;
    }
    parseString[0] = parseString[0].trim();
    parseString[1] = parseString[1].trim();

    if(parseString[0].length >= 15){
      message.channel.send("that's too many dice! quit it!");
      return;
    }
    if(parseString[1].length >= 15){
      message.channel.send("that number's too high! stop that!");
      return;
    }
    var numDice = parseInt(parseString[0], 10);
    if(numDice > 100){
      message.channel.send("dude, you don't need that many dice.");
      return;
    }
    var typeOfDie = parseInt(parseString[1], 10);
    console.log(typeOfDie);

    var rollTotal = 0;
    for(var i = 0; i < numDice; i++){
      rollTotal += random.integer(1, typeOfDie);
    }

    if(theSinew.length > 1)
      rollTotal += parseInt(theSinew[1], 10);

    message.channel.send(`you rolled a ${rollTotal}`);

  }

  if(message.content === (prefix + "info")){
    message.channel.send("hello! I'm cowbot-beeboop, the Worst Possible Bot™!");
    message.channel.send("i was made in a sleep deprived haze by Hibou, and named by the lovely Tugbee");
	}

  if (message.content === (prefix + 'ping')) {
    message.channel.send('pong');
  }

  if(message.content.startsWith(prefix + "startPoll")){ //TODO: implement vote switching
    if(ongoingPoll == true){
      console.log("ongoing poll!");
      return;
    }

    var splittable = message.content.substring(10);
    var splitProduct = splittable.split(";");
    if(splitProduct.length < 2){
      message.channel.send("sorry, poll creation failed! i didn't understand the format.");
      return;
    }
    var topic = splitProduct[0];
    var preOptions = splitProduct[1];
    var options = preOptions.split(',');
    if(options.length < 2){
      message.channel.send("sorry, poll creation failed! i didn't find enough options!");
      return;
    }

    topic = topic.trim();
    for(var i = 0; i < options.length; i++)
      options[i] = options[i].trim();

    console.log(topic);
    console.log(options);

    currentPoll = new Poll(options);
    var announcement = "Poll time, cast your votes now!\n" + "```\n" + topic + "\n\n";
    for(var i = 0; i < options.length; i++){
      announcement += "" + (i + 1) + ". " + options[i] + "\n";
    }
    announcement += "```" + "\nTo cast your vote, say \"~vote\" followed by the number of the option you want to vote for."
    message.channel.send(announcement);
    ongoingPoll = true;

    setTimeout(() => {
      //TODO: pick winners, account for ties
      ongoingPoll = false;

      var winners = currentPoll.getWinners();

      if(winners.length == 2){
        message.channel.send("And the winner is...\n```" + winners[1] + "```\nWith " + winners[0] + "% of the votes");
      } else if(winners.length == 3){
        var winAnnounce = "It's a tie! The winners are...\n```" + winners[1] + " and " + winners[2] + "```\n With " + winners[0] + "% of the vote each";
        message.channel.send(winAnnounce);
      } else {
        var winAnnounce = "It's a " + winners.length - 1 + " way tie! The winners are...\n"
        for(var i = 1; i < winners.length - 1; i++){
          winAnnounce += winners[i] + ", "
        }
        winAnnounce += "and " + winners[winners.length - 1];
        winAnnounce += "\n With " + winners[0] + "% of the vote each";
      }



      currentPoll = null;
      console.log("poll ended")}, 300000)
  }

  if(message.content.startsWith(prefix + "vote")){
    if(ongoingPoll == false){
      message.channel.send("there's currently no active poll");
      return;
    }
    var voteString = message.content.substring(5);

    if(voteString.length <= 0){
      message.channel.send("i need you to pick an option to vote for, please!");
      return;
    }

    if(isNaN(voteString)){
      message.channel.send("that's not a number!");
      return;
    }

    if(voteString.length >= 15){
      message.channel.send("that's too high! quit it!");
      return;
    }

    var vote = parseInt(voteString);

    if(vote <= 0 || vote > currentPoll.getTotalOptions()){
      message.channel.send("invalid vote, try again");
      return;
    }

    var result = currentPoll.addVote(id, vote);
    if(!result){
      message.channel.send("you already voted!");
      return;
    }

    var currentStats = currentPoll.getCurrentStats();
    console.log(currentStats);

    var announcement = "The current standings are:\n";
    for(var i = 0; i < currentStats.length; i++){
      announcement += (i+1) + ". " + currentStats[i][0] + " - " + currentStats[i][1]+ "\n";
    }
    message.channel.send("```" + announcement + "```");
  }


  if(guildConf.sillyActive){
    var guildID = message.guild.id;
    if(message.content === (prefix + "silly?")){
      message.channel.send("silly.");
    }

    if(message.content === (prefix + "s init")){ //TODO: rejigger the map to be a plain object since JSON doesnt like maps
      fs.stat("images/" + guildID + ".txt", function(err, stat) {
        if(err == null) {
          //file exists
          console.log("file exists. confirmed confirmed.");
        } else if (err.code == 'ENOENT') {
          //file does not exist
          console.log("file doesn't exist, creating file.");
          var images = {};
          images["incomprehensible"] = "https://78.media.tumblr.com/897db204cf9f9a548f7cee9db141d815/tumblr_p5a16aFKMg1relhh1o1_500.jpg";
          images["hard pass"] = "https://78.media.tumblr.com/73e78f1c5bba807662777dfce451d2f4/tumblr_inline_p573u2r6Vq1tl7hml_500.jpg";
          images["cash money"] = "https://78.media.tumblr.com/c041055e2dc5207ca43d32aa0a4d2660/tumblr_inline_p4yp61RSqR1raiqbg_500.jpg";
          var json = JSON.stringify(images);
          console.log(json);
          fs.writeFile("images/" + guildID + ".txt", json, 'utf8', function initCallback(err){
            if(err != null)
              console.log(err);
            else
              console.log("summoner initialized!");
          });
          
        } else {
          console.log(err.code);
        }
      });
      return;
    }

    if(message.content.startsWith(prefix + "s add")){
      var guildID = message.guild.id;

      var splitTemp = message.content.substring(6).trim();
      var data = splitTemp.split(",");
      if(data.length != 2){
        message.channel.send("sorry, i don't recognize that format. did you forget the comma?");
        return;
      }
      var name = data[0].trim();
      var url = data[1].trim();

      console.log(url);
      
      fs.readFile("images/" + guildID + ".txt", 'utf8', function readFileCallback(err, data){
        if(err){
          console.log(err);
        } else {
          var images = JSON.parse(data);
          images[name] = url;
          var json = JSON.stringify(images);
          fs.writeFile("images/" + guildID + ".txt", json, 'utf8', function readCallback(err){
            if(err != null)
              console.log(err);
            else
              message.channel.send("image added!");
          });
        }
      });
      return;
    }

    if(message.content === prefix + "s list"){
      var mess = "``~Summonable Images~\n";

      fs.readFile("images/" + guildID + ".txt", 'utf8', function readFileCallback(err, data){
        if(err){
          console.log(err);
        } else {
          var images = JSON.parse(data);
          for(var key in images){
            mess += "• " + key + "\n";
          }
          mess += "``";
          message.author.send(mess);
        }
      });
      return;
    }

    if(message.content.startsWith(prefix + "s delete")){
      var name = message.content.substring(10).trim();
      if(name.length == 0){
        message.channel.send("please specify an image to delete");
        return;
      }

      fs.readFile("images/" + guildID + ".txt", 'utf8', function readFileCallback(err, data){
        if(err){
          console.log(err);
        } else {
          var images = JSON.parse(data);
          delete images[name];
          console.log(name);
          var json = JSON.stringify(images);
          fs.writeFile("images/" + guildID + ".txt", json, 'utf8', function readCallback(err){
            if(err != null)
              console.log(err);
            else
              message.channel.send("image added!");
          });
        }
      });

      return;
    }

    if(message.content.startsWith(prefix + "s rename")){
      var splitTemp = message.content.substring(10).trim();
      var data = splitTemp.split(",");
      if(data.length != 2){
        message.channel.send("sorry, i don't recognize that format. did you forget the comma?");
        return;
      }
      var name = data[0].trim();
      var newName = data[1].trim();

      fs.readFile("images/" + guildID + ".txt", 'utf8', function readFileCallback(err, data){
        if(err){
          console.log(err);
        } else {
          var images = JSON.parse(data);
          images[newName] = images[name];
          delete images[name];
          console.log(name);
          var json = JSON.stringify(images);
          fs.writeFile("images/" + guildID + ".txt", json, 'utf8', function readCallback(err){
            if(err != null)
              console.log(err);
            else
              message.channel.send("renamed image successfully!");
          });
        }
      });

      return;
    }

    if(message.content.startsWith(prefix + "s")){ //note to self, always make sure this method is defined last
      var guildID = message.guild.id;             //why? because i hate god and also myself
      var splitTemp = message.content.substring(2);
      splitTemp = splitTemp.trim();
      if(splitTemp.length < 1){
        message.channel.send("you need to specify a name!");
      }

      fs.readFile("images/" + guildID + ".txt", 'utf8', function readFileCallback(err, data){
        if(err){
          console.log(err);
        } else {
          var images = JSON.parse(data);
          
          var url = images[splitTemp];
          message.channel.send("", { file: url});
        }
      });
      message.delete();
    }

    if(message.content.toLowerCase().includes("release the rats")){
      if(ratsOnCooldown){
        message.channel.send("the rats are regrouping...");
        return;
      }

      var numRats = random.integer(0, 10);
      var rat3 = client.emojis.find("name", "rat3");
      var rat2 = client.emojis.find("name", "rat2");
      var rat1 = client.emojis.find("name", "rat1");
      if(rat3.length < 3 || rat2.length < 3 || rat1.length < 3){
        console.log("rats not released");
        return;
      }

      var mess = "" + rat3 + "\n";
      for(var i = 0; i < numRats; i++){
        mess += rat2 + "\n";
      }
      mess += rat1;
      message.channel.send(mess);
      ratsOnCooldown = true;
      setTimeout(() => {ratsOnCooldown = false}, numRats * 30000);
    }

    if(message.content.startsWith(prefix + "connect")){
      var loadList = [];
      for(i in sauce.connect){
        loadList.push(sauce.connect[i]);
      }
      // console.log(loadList.length);
      var picIndex = random.integer(0, loadList.length);
      // console.log(picIndex);
      var picture = loadList[picIndex];
      message.channel.send("", { file: picture });
    }

    if(message.content.startsWith(prefix + "embiggen")){
      var temp = message.content.split(" ");
      if(temp.length != 2){
        message.channel.send("one emoji at a time, please!");
        return;
      }

      // console.log(message.content);
      var emojiCode = temp[1];

      if(emojiCode.charAt(0) != '<' || emojiCode.charAt(emojiCode.length - 1) != '>'){
        return;
      }

      var emojiName = (emojiCode.split(":"))[1];
      emojiName = emojiName.trim();
      var emoji = client.emojis.find("name", emojiName);
      if(emoji == null || emoji.url == null){
        message.channel.send("i can't reach that emoji!");
        return;
      }

      message.channel.send("", { file: emoji.url});
    }

    if(message.content === (prefix + 'beemovie')){
      message.channel.send(sauce.beemovie1);
      message.channel.send(sauce.beemovie2);
      message.channel.send(sauce.beemovie3);
      message.channel.send(sauce.beemovie4);
      message.channel.send(sauce.beemovie5);
      message.channel.send(sauce.beemovie6);
      message.channel.send(sauce.beemovie7);
      message.channel.send(sauce.beemovie8);
      message.channel.send(sauce.beemovie9);
      message.channel.send(sauce.beemovie10);
      message.channel.send(sauce.beemovie11);
      message.channel.send(sauce.beemovie12);
      message.channel.send(sauce.beemovie13);
      message.channel.send(sauce.beemovie14);
      message.channel.send(sauce.beemovie15);
      message.channel.send(sauce.beemovie16);
      message.channel.send(sauce.beemovie17);
      message.channel.send(sauce.beemovie18);
      message.channel.send(sauce.beemovie19);
      message.channel.send(sauce.beemovie20);
      message.channel.send(sauce.beemovie21);
      message.channel.send(sauce.beemovie22);
      message.channel.send(sauce.beemovie23);
      message.channel.send(sauce.beemovie24);
      message.channel.send(sauce.beemovie25);
      message.channel.send(sauce.beemovie26);
    }

    if (message.content === (prefix + 'roulette')) {
      if(guildConf.rouletteActive){
        var num = random.integer(1,6);
        if(num == 1){

          member.kick("You've been shot, dude\n");
          message.channel.send(`${name} is fuckin dead`);

          // var invite = message.channel.createInvite();
          // eris.getDMChannel(id).then((dmChannel) => { 
          // dmChannel.createMessage(`here's a band-aid, now get back in here https://discord.gg/${invite.code}`);
          // return; 
        // });
          
        } else {
          message.channel.send(`Click.`);
        }
      
      } else {
        message.channel.send("No bullets!");
      }
    }

    if(message.content === (prefix + 'cuck')) {
      message.channel.send("", {
      file: "https://i.imgur.com/irLkkzZ.png"
      });
    }

    if(message.content.includes('@anyone')){
      var guild = message.guild;
      var keys = guild.members.keyArray();

      var size = keys.length
      var luckyWinner = random.integer(0, size-1);
      var ID = keys[luckyWinner];
      var member = guild.members.get(ID);
      // message.edit(message.content.replace(`${member.user}`));

      message.channel.send(`${member.user}`)
      .then(message => message.delete());
    }

    // if(message.content.startsWith('@supereveryone')){ //DESTROY THIS COMMAND 4.2.2018
    //   var guild = message.guild;
    //   var keys = guild.members.keyArray();
    //   var mess = "";

    //   for(var i = 0; i < keys.length; i++){
    //     var ID = keys[i];
    //     var member = guild.members.get(ID);
    //     message.channel.send(`${member.user}`)
    //     .then(message => message.delete());
    //   }
    // }
  }
});

client.login(cfig.token);

