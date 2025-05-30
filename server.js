const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;
const axios = require('axios');
const tagCoolDown = 2000;
const tagTime = 60;
const laserTagTime = 120;
const tagWaitTime = 10; 
const laserTagWaitTime = 1;
const leoProfanity = require('leo-profanity');
let online = {};
let chat = {};
const customWords = ['niga', 'nigas', 'fucked', 'niger', 'nigar', 'nigers', 'ilikballs', 'ilikeballs', 'fucker', 'n!gers', 'n!ger', 'n1ga', 'n1ger', 'n1gas', 'n1gers', 'dih'];
function randomName() {
  return `${(a=>a[Math.floor(Math.random()*a.length)])(['Dark','Silent','Lonely','Shining','Secret','Fun','Excited','Happy','Spicy'])} ${(b=>b[Math.floor(Math.random()*b.length)])(['Glitch','Frog','Bear','Pepper','io game'])}`
}
function banId(playerId, duration, reason = "rule violation") {
  if(!data.bannedIds) data.bannedIds = {}
  data.bannedIds[playerId] = {
  reason: reason,
  until: Date.now() + 1000 * 60 * duration * 60
};
scheduleSave()
}

function normalize(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '')     // remove punctuation
    .replace(/(.)\1{1,}/g, '$1');   // reduce repeated letters
}
function normalizeName(name) {
  return name.toLowerCase().replace(/[ .]/g, '');
}

function cleanProfanity(input) {
  if (!cleanProfanity.loaded) {
    leoProfanity.loadDictionary();
    leoProfanity.add(customWords);
    cleanProfanity.loaded = true;
  }

  const words = input.split(/\b/);
  let bad = false;

  const cleanedWords = words.map(word => {
  const normalizedWord = normalize(word);
  const isBad =
    leoProfanity.check(normalizedWord) || customWords.includes(normalizedWord);
  if (isBad) {
    bad = true;
    return '*'.repeat(word.length);
  }

  return word;
});


  return {
    cleaned: cleanedWords.join(''),
    bad
  };
}




let game = {   
  tag: {},
  laserTag: {},
};   
const tagMaps = ["forest", "city", "cave", "school"]
const laserTagMaps = ["forest", "city", "cave", "school"]

const { GITHUB_TOKEN, GITHUB_USER, GITHUB_REPO, GITHUB_FILE_PATH } = process.env;

const baseURL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'axios', 
};
async function updateFileInRepo(newData) {
  try {
    const getResponse = await axios.get(baseURL, { headers });
    const sha = getResponse.data.sha;

    const content = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');

    const putResponse = await axios.put(baseURL, {
      message: 'Update data.json',
      content,
      sha,
    }, { headers });
    return putResponse.data;
  } catch (error) {
    const errData = error.response?.data || error;
    if (errData.message?.includes('does not match')) {
      console.error('⚠️ Conflict: SHA is outdated. Fetch the file again before updating.');
    } else {
      console.error('❌ Update failed:', errData);
    }
  }
}
const getFileFromRepo = async () => {
  const response = await axios.get(baseURL, { headers });
  const content = Buffer.from(response.data.content, 'base64').toString();
  return JSON.parse(content);
};
let pendingSave = false;
function scheduleSave() {
  if (pendingSave) return Promise.resolve(false); // Already scheduled

  pendingSave = true;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        pendingSave = false;
        await updateFileInRepo(data);
        resolve(true); // Update complete
      } catch (err) {
        reject(err); // Pass any error that occurred
      }
    }, 10000);
  });
}

let data;
const run = async () => {
  data = await getFileFromRepo();
  const TEN_DAYS = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds
const now = Date.now();
Object.keys(data.players).forEach((playerId) => {
  const playerData = data.players[playerId];
  if (playerData.lastUpdated && now - playerData.lastUpdated > TEN_DAYS) {
    delete data.players[playerId];
    console.log(`Removed inactive player: ${playerId}`);
  } else if(!playerData.lastUpdated) {
    playerData.lastUpdated = now;
  }
});
  if(data.bannedIds) Object.keys(data.bannedIds).forEach((id)=>{
    if(data.bannedIds[id].until < Date.now()) delete data.bannedIds[id];
  })
scheduleSave()
}; 
run()

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});


app.use(express.static("public"));
 const pages = [
   '/',
   '/create/',
   '/create/editor/',
   '/play/',
   '/about/',
   '/contact/',
   '/privacy/',
   '/terms/',
   '/tag/',
   '/laserTag/',
 ];
 app.get('/sitemap.txt', (req, res) => {
   const host = req.get('host'); 
   const protocol = req.protocol;
   const domain = `${protocol}://${host}`;

   const sitemapTxt = pages.map(path => `${domain}${path}`).join('\n');

   res.header('Content-Type', 'text/plain');
   res.send(sitemapTxt);
 });

// Utility Functions
function generateRandomString(length, jsLet, existingObjects) {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  if (jsLet) characters = "abcdefghijklmnopqrstuvwxyz";
  
  let existingStrings = existingObjects && typeof existingObjects === 'object' ? Object.keys(existingObjects) : [];
  let result;
  do {
    result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (existingStrings.includes(result));
  
  return result;
}


function removeString(array, str) {
  const index = array.indexOf(str);
  if (index !== -1) array.splice(index, 1);
}

// Game-Specific Functions
function joinGameRoom(socket, playy, gameType, startGameCallback, roomType, mapChoice, timeChoice) {
  let world;
  const playerId = playy.id;
  const playerName = playy.name;
  const joinRoom = () => {
   if(game[gameType][world]) {
      socket.join(world);
    socket.room = world; // Assign the room to socket.room for later access
    socket.playerId = playy.id;
    if(!data.players[playy.id]) data.players[playy.id] = {name: randomName()}
    if(gameType == "tag") socket.emit("world", {world: world, map: game.tag[world].map, random: game.tag[world].random || "nothing", name: data.players[playy.id].name});
     if(gameType == "laserTag") socket.emit("world", {world: world, map: game.laserTag[world].map, random: game.laserTag[world].random || "nothing"});
     socket.to(world).emit("chat message", {
      message: `${data.players[playy.id].name} joined the game`,
      id: "server",
      name: "server",
    });

    const players = game[gameType][world].players;
    if (players.length > 0) {
      const playersList = players.map((id) => data.players[id].name).join(", ");
      socket.emit("chat message", {
        message: `You joined the game. Players: ${playersList}`,
        id: "server",
        name: "server",
      });
    } else {
      socket.emit("chat message", {
        message: "You're the first one to join.",
        id: "server",
        name: "server",
      });
    }

    players.push(playerId);
    io.to(world).emit("time to start", "waiting for players...");

    if (players.length > 9) {
      startGameCallback();
      clearInterval(game[gameType][world].intervalStart);
    } else if (players.length > 1 && !game[gameType][world].started) {
      if (game[gameType][world].intervalStart)
        clearInterval(game[gameType][world].intervalStart);
      game[gameType][world].timeToStart = tagWaitTime;
      game[gameType][world].intervalStart = setInterval(() => {
        if (game[gameType][world]) {
          io.to(world).emit("time to start", game[gameType][world].timeToStart);
          game[gameType][world].timeToStart--;
          if (game[gameType][world].timeToStart < 1 && players.length > 1) {
            startGameCallback();
            clearInterval(game[gameType][world].intervalStart);
          }
        }
      }, 1000);
    }
   } else {
     
   }
  };
  function addRocks(gameType, world) {
    let random = [];
      for(let i = 0; i < 30; i++) {
        let xp = (Math.random()*100)-50;
        let yp = (Math.random()*100)-50;
        let xs, ys, zs = 0;
        while(xs < 1) xs = Math.random()*3
        while(ys < 1) ys = Math.random()*3
        while(zs < 1) zs = Math.random()*3
        random.push({xp: xp, yp: yp, xs: xs, ys: ys, zs: zs})
      }
      game[gameType][world].random = random
  }
if (roomType == "public") {
  let roomFound = false;
  Object.keys(game[gameType]).forEach((roomKey) => {
    if (!game[gameType][roomKey].started && !roomFound && roomKey.split("-")[1] != "private") {
      roomFound = true;
      world = roomKey;
      joinRoom();
    }
  });

  if (!roomFound) {
     world = `${gameType}-${generateRandomString(5, false, game[gameType])}`;
    if(gameType == "tag") {
      game[gameType][world] = {
      players: [],
      started: false,
      timeToStart: tagWaitTime,
      intervalStart: undefined,
      map: tagMaps[Math.floor(Math.random() * tagMaps.length)],
      cooldown: true,
    };
    } else if (gameType == "laserTag") {
      game[gameType][world] = {
      players: [],
      started: false,
      timeToStart: laserTagWaitTime,
      intervalStart: undefined,
      map: laserTagMaps[Math.floor(Math.random() * laserTagMaps.length)],
      cooldown: true,
        zapOuts: {"no one": -10}
    };
    }
    
    if(game[gameType][world].map == "forest") {
      addRocks(gameType, world)
    }
    joinRoom();
} 
  
  } else {  
  if(roomType == "create"){
    world = `${gameType}-private-${generateRandomString(5, true, game[gameType])}`;
    
    game[gameType][world] = {
      players: [],
      started: false,
      timeLeft: timeChoice,
      timeToStart: tagWaitTime,
      intervalStart: undefined,
      map: mapChoice,
      cooldown: true,
    }; 
    if(game[gameType][world].map === "forest") {
      addRocks(gameType, world)
    }
    joinRoom();
  } else {
    
    
    if(game[gameType][roomType] && !game[gameType][roomType].started) {
      world = roomType;
      joinRoom();
    } else if(game[gameType][roomType] && game[gameType][roomType].started) {
       socket.emit("not found")
      socket.emit("chat message", {id: "server", name: "server", message: "The game you are trying to join has already started, sending you back."})
    } else {
      socket.emit("not found")
      socket.emit("chat message", {id: "server", name: "server", message: "The room you are trying to join does not exist, sending you back."})
    }
  } 
 
}
}
function startTag(world) {
  const players = game.tag[world].players;
  game.tag[world].started = true;
  game.tag[world].timeLeft = game.tag[world].timeLeft || tagTime;
  
  const randomIndex = Math.floor(Math.random() * players.length);
  game.tag[world].whoIt = players[randomIndex];
  io.to(world).emit("game start", players[randomIndex]);

  const gameTimer = setInterval(() => {
    if(game.tag[world] && game.tag[world].timeLeft){
     game.tag[world].timeLeft--;
    io.to(world).emit("time left", game.tag[world].timeLeft);
    if (game.tag[world].timeLeft < 1) {
      clearInterval(gameTimer);
      endGame(world, "tag");
    } 
    }
  }, 1000);
}
function startLaserTag(world1) {
  let world = game.laserTag[world1]
  const players = world.players;
  world.started = true;
  world.timeLeft = world.timeLeft || laserTagTime;
  io.to(world1).emit("game start");
  const gameTimer = setInterval(() => {
    if(world && world.timeLeft){
     world.timeLeft--;
    io.to(world1).emit("time left", world.timeLeft);
    if (world.timeLeft < 1) {
      clearInterval(gameTimer);
      endGame(world1, "laserTag");
    } 
    }
  }, 1000);
}
function startFreezeTag(world1) {
  let world = game.laserTag[world1]
  const players = world.players;
  world.started = true;
  world.timeLeft = world.timeLeft || laserTagTime;
  io.to(world1).emit("game start");
  const randomIndex = Math.floor(Math.random() * players.length);
  game.freezeTag[world].freezer = players[randomIndex];
  io.to(world).emit("game start", players[randomIndex]);
  const gameTimer = setInterval(() => {
    if(world && world.timeLeft){
     world.timeLeft--;
    io.to(world1).emit("time left", world.timeLeft);
    if (world.timeLeft < 1) {
      clearInterval(gameTimer);
      endGame(world1, "freezeTag");
    } 
    }
  }, 1000);
}
function endGame(world, gameType, noOneLeft) {
  io.to(world).emit("game over");
  if(!noOneLeft) {
  if (gameType === "tag") {
    let winners;
  let losers;
    losers = game[gameType][world].whoIt;
    winners = game[gameType][world].players.filter(
      (player) => player !== losers
    );
     let lose
  if(typeof losers == "object" && losers.length > 1) {
    lose = losers.map((id) => data.players[id].name).join(", ")
  } else {
    lose = data.players[losers].name
  }
    let winnerText = "";
    winners.forEach((id, index)=>{
      data.players[id].tagWins = 'tagWins' in data.players[id] ? data.players[id].tagWins + 1 : 1;
      if (index+1 != winners.length) winnerText = winnerText+data.players[id].name+", "
      if (index+1 === winners.length) winnerText = winnerText+"and "+data.players[id].name
      if(winners.length === 1) winnerText = data.players[id].name
    })
  io.to(world).emit("chat message", {
    id: "server",
    name: "server",
    message: `${winnerText} won! And ${
       lose
    } lost!`,
  });
    data.gamesPlayed++
    console.log(data.gamesPlayed)
    scheduleSave();
  } else if(gameType == "laserTag") {
    let topPlayers = [["id", 0]]
    if(game[gameType][world] && game[gameType][world].zapOuts) Object.keys(game[gameType][world].zapOuts).forEach((key)=>{
      if(game[gameType][world].zapOuts[key] > topPlayers[0][1]) {
        topPlayers = [[key, game[gameType][world].zapOuts[key]]];
      } else if(game[gameType][world].zapOuts[key] === topPlayers[0][1]) {
        topPlayers.push([key, game[gameType][world].zapOuts[key]]);
      }
    })
    if(topPlayers[0][0] === "id") {
      io.to(world).emit("chat message", {
    id: "server",
    name: "server",
    message: "No one got any zapouts so there is no winner...",
  });
    } else {
      if (topPlayers.length > 1) {
        const winners = topPlayers.map(player => data.players[player[0]].name).join(", ");
        io.to(world).emit("chat message", {
          id: "server",
          name: "server",
          message: `${winners} tied for first with ${topPlayers[0][1]} zapouts!`,
        });
      } else {
        io.to(world).emit("chat message", {
          id: "server",
          name: "server",
          message: `${data.players[topPlayers[0][0]].name} won with ${
             topPlayers[0][1]
          } zapouts!`,
        });
      }
    }
data.gamesPlayed++
    console.log(data.gamesPlayed)
    scheduleSave();
  }

 
} else {
  io.to(world).emit("chat message", {
    id: "server",
    name: "server",
    message: "No one left to finish the game! Sending you back...",
  });
}
  delete game[gameType][world];
}
function getIP(reqOrSocket) {
  // If it's a socket (from Socket.IO)
  if (reqOrSocket.handshake) {
    const forwarded = reqOrSocket.handshake.headers['x-forwarded-for'];
    return (forwarded ? forwarded.split(',')[0] : null) || reqOrSocket.handshake.address;
  }

  // If it's an Express request
  const forwarded = reqOrSocket.headers?.['x-forwarded-for'];
  return (forwarded ? forwarded.split(',')[0] : null) || reqOrSocket.socket?.remoteAddress || '';
}



io.on("connection", (socket) => {
  socket.on("gamesPlayed", (code)=>{
    let adcode = process.env.ADMINCODE || "spicy"
    if(code == adcode) {
      socket.emit("gamesPlayed", data.gamesPlayed)
    }
  })
  socket.on("name", (playerId)=>{
    socket.emit("name", data.players[playerId].name)
  })
  socket.on("skinRequest", ({playerId, skin})=>{
    data.skinRequests.push({playerId: playerId, request: skin})
    if(scheduleSave()) {
      socket.emit("complete")
    } else {
      socket.emit("issue")
    } 
  })
  socket.on("contact", ({name, message, email})=>{
    data.contact.push({message: message, email: email, name: name})
    if(scheduleSave()) {
      socket.emit("complete")
    } else {
      socket.emit("issue")
    } 
  })
  socket.on("leaderboard", ()=>{
    socket.emit("leaderboard", data.players)
  })
  socket.on("mapRequest", ({playerId, mapCode})=>{
    data.mapRequests.push({playerId: playerId, request: mapCode})
    if(scheduleSave()) {
      socket.emit("complete")
    } else {
      socket.emit("issue")
    } 
  })
  socket.on("getAllRequests", (code)=>{
    let adcode = process.env.ADMINCODE || "spicy"
    if(code == adcode) {
    socket.emit("allRequests", {reports: data.reports, players: data.players, skinRequests: data.skinRequests, mapRequests: data.mapRequests, contact: data.contact, newNames: data.newNames})
    } 
    
  })
  socket.on("removeRequest", ({code, type, index})=>{
    let adcode = process.env.ADMINCODE || "spicy"
    if(code == adcode) {
      if(type == "newNames") {
        delete data.newNames[index]
      } else {
        data[type].splice(index, 1);
      }
      scheduleSave();
      socket.emit("allRequests", {reports: data.reports, players: data.players, skinRequests: data.skinRequests, mapRequests: data.mapRequests, contact: data.contact, newNames: data.newNames})
    } 
    
  })
  socket.on("world", (stuff) => {
    socket.playerId = stuff.id;
    if(data.players[stuff.id]) data.players[stuff.id].lastUpdated = Date.now();
  scheduleSave();
    if (data.bannedIds) {
    const ban = data.bannedIds[stuff.id];
    if (ban && typeof ban.until === 'number' && Date.now() < ban.until) {
      console.log(ban, "ban")
      const endTime = new Date(ban.until).toLocaleString('en-US', {
  timeZone: 'America/New_York', // or your desired time zone
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
     socket.emit("banned", "You have been banned until "+endTime+" ET. Reason: "+ban.reason)
      socket.disconnect();
      return;
    }
  }
    if(online[stuff.id]) {
      socket.emit("kick")
      socket.disconnect();
      return;
    }
    if (stuff.world === "tag") {
      if(!stuff.map) stuff.map = "forest"
      if(!stuff.time) stuff.time = 60
      joinGameRoom(socket, stuff, "tag", () => startTag(socket.room), stuff.room, stuff.map, stuff.time);
    } else if(stuff.world === "laser tag") {
       if(!stuff.map) stuff.map = "forest"
      if(!stuff.time) stuff.time = 60;
      joinGameRoom(socket, stuff, "laserTag", () => startLaserTag(socket.room), stuff.room, stuff.map, stuff.time);
    } else if (stuff.world === "freezeTag") {
      if(!stuff.map) stuff.map = "forest"
      if(!stuff.time) stuff.time = 60;
      joinGameRoom(socket, stuff, "freezeTag", () => startFreezeTag(socket.room), stuff.room, stuff.map, stuff.time);
    }
    online[stuff.id] = true; 
  });
  socket.on("player update", function (data2) {
    let data3 = data2;
  const world = socket.room;
    if(world && game[world.split("-")[0]][world] && !game[world.split("-")[0]][world].started) data3.name = data.players[data3.id].name
  socket.to(world).emit("player update", data3);
});
socket.on("change name", ({playerId, name})=>{
  if(!data.players[playerId]) data.players[playerId] = {}
  if(cleanProfanity(name).bad) name = randomName()
  data.bannedNames.forEach((bannedName)=>{
    if(name.toLowerCase().includes(bannedName)) name = randomName()
  })
  Object.keys(data.players).forEach((key)=>{
      if(data.players[key].name && normalizeName(name) === normalizeName(data.players[key].name)) name = name+" 2.0"
    })
  socket.emit("change name", name)
    data.players[playerId].name = name
  if(!data.newNames) data.newNames = {}
    data.newNames[playerId] = name
    scheduleSave()
})
  socket.on("ban name", ({code, name})=>{
    let adcode = process.env.ADMINCODE || "spicy"
    if(code === adcode) {
      data.bannedNames.push(name.toLowerCase()) 
    Object.keys(data.players).forEach((key)=>{
      if(data.players[key].name.toLowerCase().includes(name.toLowerCase())) data.players[key].name = randomName()
    })
    scheduleSave()
    }
  })
  socket.on("player tagged", (tagged) => {
    const world = socket.room;
    if (game.tag[world]?.started && game.tag[world].cooldown) {
      game.tag[world].whoIt = tagged;
      io.to(world).emit("player tagged", tagged);
      io.to(world).emit("chat message", {
        message: `${data.players[tagged].name} was tagged!`,
        id: "server",
        name: "server",
      });
      game.tag[world].cooldown = false;
      setTimeout(()=>{
        if(game.tag[world]) game.tag[world].cooldown = true;
      }, tagCoolDown)
    }
  });
  socket.on("player zapped", (data) =>{
    const world = game.laserTag[socket.room];
    if(world && world.started) {
      io.to(socket.room).emit("player zapped", data);
    }
  })
  socket.on("zap", (zapData)=>{
    const world = game.laserTag[socket.room];
    if(world) {
      io.to(socket.room).emit("zap", zapData);
    }
  })
  socket.on("player zapped out", (zappp) =>{
    const world = game.laserTag[socket.room];
    if(!world.zapOuts) world.zapOuts = {}
    if(world && world.started) {
      if(world.zapOuts[zappp.zapper]) {
        world.zapOuts[zappp.zapper]++;    
      } else {
        world.zapOuts[zappp.zapper] = 1;
      } 
      io.to(socket.room).emit("player zapped out", zappp);
      io.to(socket.room).emit("chat message", {
        message: `${data.players[zappp.zapped].name} was zapped out by ${data.players[zappp.zapper].name}!`,
        id: "server",
        name: "server",
      });
    }
  })

  socket.on("chat message", (data2) => {
    let message = data2;
    if(message.message.toLowerCase().startsWith("/report") && chat[socket.room]) {
      data.reports.push(chat[socket.room])
      scheduleSave()
      io.to(socket.room).emit("chat message", {
        message: "The chat logs have been reported.",
        id: "server",
        name: "server",
      });
    } else {
if(chat[socket.room])   chat[socket.room].push(message)
      if(!chat[socket.room]) chat[socket.room] = [message]
     message.message = cleanProfanity(message.message).cleaned
    if(data.players[data2.id]) message.name = data.players[data2.id].name
    io.to(socket.room).emit("chat message", message); 
    }
  }); 
   socket.on("ban player", (banData) => {
     let adcode = process.env.ADMINCODE || "spicy"
  if(banData.code === adcode) {
    console.log(banData.id)
banId(banData.id, banData.time, banData.reason); 
  }
     
  }); 
socket.on("disconnecting", () => {
    if (socket.playerId) {
      delete online[socket.playerId];
    }
  });
  socket.on("disconnect", () => {
  if (!socket.room) {
    return;
  }
  const world = socket.room;
  const playerId = socket.playerId;
  const gameType = world.split("-")[0]
  const gameworld = game[gameType][world]
  delete online[socket.playerId];
  if (gameworld) {
    removeString(gameworld.players, playerId);
    socket.to(world).emit("player left", playerId);
    io.to(world).emit("chat message", {
      message: `${data.players[playerId].name} left the game`,
      id: "server",
      name: "server",
    });
    if(gameType == "tag" && playerId === gameworld.whoIt) {
      const randomIndex = Math.floor(Math.random() * gameworld.players.length);
      gameworld.whoIt = gameworld.players[randomIndex]
      io.to(world).emit("player tagged", gameworld.whoIt);
      io.to(world).emit("chat message", {
        message: `${data.players[gameworld.whoIt].name} is it now!`,
        id: "server",
        name: "server",
      });
    }

    if (gameworld.players.length < 2) {
      gameworld.started = false;
      clearInterval(gameworld.intervalStart);
      gameworld.intervalStart = undefined;
      gameworld.timeToStart = 30;
      endGame(world, gameType, true);
    } 
  }
});

});

