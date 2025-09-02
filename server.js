const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("dotenv").config();
const port = process.env.PORT || 3000;
const axios = require('axios');
const tagCoolDown = 2000;
const tagTime = 60;
const laserTagTime = 120;
const tagWaitTime = 10; 
const laserTagWaitTime = 10;
const leoProfanity = require('leo-profanity');
let chat = {};
const customWords = ['niga', 'nigas', 'fucked', 'niger', 'nigar', 'nigers', 'ilikballs', 'ilikeballs', 'fucker', 'n!gers', 'n!ger', 'n1ga', 'n1ger', 'n1gas', 'n1gers', 'dih', 'dik', 'dick', 'd!ck', 'd!cks', 'd!ckhead', 'd!ckheads', 'd!cks', 'd!ckheads', 'd!ckhead', 'd!cks'];
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
  infection: {},
  racing: {}
};   
const tagMaps = ["forest", "city", "cave", "school", "noGravity"]
const laserTagMaps = ["forest", "city", "cave", "school", "noGravity"]

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
  const TEN_DAYS = 10 * 24 * 60 * 60 * 1000; 
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
  const joinRoom = () => {
   if(game[gameType][world]) {
      socket.join(world);
    socket.room = world; // Assign the room to socket.room for later access
    socket.playerId = playy.id;
    if(!data.players[playy.id]) data.players[playy.id] = {name: randomName()}
    if(gameType == "tag") socket.emit("world", {world: world, map: game.tag[world].map, random: game.tag[world].random || "nothing", name: data.players[playy.id].name});
     if(gameType == "laserTag") socket.emit("world", {world: world, map: game.laserTag[world].map, random: game.laserTag[world].random || "nothing"});
      if(gameType == "racing") socket.emit("world", {world: world, map: game.racing[world].map});
      if(gameType == "infection") socket.emit("world", {world: world, map: game.infection[world].map, random: game.infection[world].random || "nothing"});
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
      if(gameType === "infection") {
        if(players.length > 2) {
          join()
        } else {
           io.to(world).emit("time to start", "waiting for one more player...");
        }   
      } else {
        join()
      }
      function join() {
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
    }
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
    } else if (gameType == "racing") {
      game[gameType][world] = {
      players: [],
      started: false,
      timeToStart: laserTagWaitTime,
      intervalStart: undefined,
      map: "test"
    };
    } else if(gameType == "infection") {
      game[gameType][world] = {
        players: [],
        started: false,
        timeToStart: tagWaitTime,
        intervalStart: undefined,
        map: tagMaps[Math.floor(Math.random() * tagMaps.length)],
        cooldown: true,
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
function startRacing(world1) {
  let world = game.racing[world1]
  const players = world.players;
  world.started = true;
  io.to(world1).emit("game start");
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
function startInfection(world1) {
  let world = game.infection[world1]
  const players = world.players;
  world.started = true;
  world.timeLeft = world.timeLeft || laserTagTime;
  const randomIndex = Math.floor(Math.random() * players.length);
  setTimeout(()=>{
    io.to(world1).emit("chat message", {
      id: "server",
      name: "server",
      message: `${data.players[players[randomIndex]].name} is infected!`,
    })
  }, 2000)
    io.to(world1).emit("game start", players[randomIndex]);
  world.infected = [players[randomIndex]]
  const gameTimer = setInterval(() => {
    if(world && world.timeLeft){
     world.timeLeft--;
    io.to(world1).emit("time left", world.timeLeft);
    if (world.timeLeft < 1) {
      clearInterval(gameTimer);
      endGame(world1, "infection");
    } 
    }
  }, 1000);
  world.gameTimer = gameTimer;
}
function endGame(world, gameType, noOneLeft, twoPlayer) {
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
        
        topPlayers.forEach(player => {
          data.players[player[0]].laserTagWins = 'laserTagWins' in data.players[player[0]] ? data.players[player[0]].laserTagWins + 1 : 1;
        });
        const winners = topPlayers.map(player => data.players[player[0]].name).join(", ");
        io.to(world).emit("chat message", {
          id: "server",
          name: "server",
          message: `${winners} tied for first with ${topPlayers[0][1]} zapouts!`,
        });
      } else {
        data.players[topPlayers[0][0]].laserTagWins = 'laserTagWins' in data.players[topPlayers[0][0]] ? data.players[topPlayers[0][0]].laserTagWins + 1 : 1;
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
  } else if(gameType == "infection") {
    let winners;
  let losers;
    let gameworld = game[gameType][world];
  if(gameworld) {
    losers = gameworld.infected;
    winners = gameworld.players.filter(
      (player) => !losers.includes(player)
    );
     let lose
  if(typeof losers == "object" && losers.length > 1) {
    lose = losers.map((id) => data.players[id].name).join(", ")
  } else {
    lose = data.players[losers].name
  }
    let winnerText = "";
    winners.forEach((id, index)=>{
      data.players[id].infectionWins = 'infectionWins' in data.players[id] ? data.players[id].infectionWins + 1 : 1;
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
    gameworld.started = false;
    clearInterval(gameworld.intervalStart);
    clearInterval(gameworld.gameTimer);
    gameworld.intervalStart = undefined;
    gameworld.timeToStart = 30;
  }
  }
} else {
    if(twoPlayer) {
      io.to(world).emit("chat message", {
    id: "server",
    name: "server",
    message: "The game ended because there are only 2 players left.",
  });
    } else {
      io.to(world).emit("chat message", {
        id: "server",
        name: "server",
        message: "No one left to finish the game! Sending you back...",
      });
    }
}
  if(game[gameType][world]) delete game[gameType][world];
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
  socket.on("getName", (playerId)=>{
    socket.emit("getName", data.players[playerId])
  if(playerId === "50hV0UG2FP1ox14CYNXG") {
    socket.emit("customSkin", "https://cdn.jsdelivr.net/gh/cHacHaem/mmspicyassets@main/crock.glb")
  }
  })
  socket.on("leaderboard", (gameType)=>{
    if (gameType === "random") {
      let leaderboard = Object.entries(data.players)
        .map(([playerId, player]) => {
          let totalWins = (player.tagWins || 0) + (player.laserTagWins || 0) + (player.infectionWins || 0);
          return [playerId, { ...player, totalWins }];
        })
        .filter(([, player]) => player.totalWins > 0)
        .sort(([, a], [, b]) => b.totalWins - a.totalWins)
        .slice(0, 20)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      if(Object.keys(leaderboard).length === 0) {
        leaderboard = Object.entries(data.players).slice(0, 20)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      }
      socket.emit("leaderboard", leaderboard);
      return;
    } else {
      let leaderboard = Object.entries(data.players)
        .filter(([, player]) => player[`${gameType}Wins`] > 0)
        .sort(([, a], [, b]) => (b[`${gameType}Wins`] || 0) - (a[`${gameType}Wins`] || 0))
        .slice(0, 20)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      if(Object.keys(leaderboard).length === 0) {
        leaderboard = Object.entries(data.players).slice(0, 20)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      }
      socket.emit("leaderboard", leaderboard)
    }

  })
  socket.on("allPlayers", ()=>{
    socket.emit("leaderboard", data.players)
  })
  
  socket.on("resetWins", (code)=>{
    let adcode = process.env.ADMINCODE || "spicy"
    if(code == adcode) {
      Object.keys(data.players).forEach((player)=>{
        data.players[player].tagWins = 0;
        data.players[player].laserTagWins = 0;
        data.players[player].infectionWins = 0;
      })
      scheduleSave();
    }
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
      if(type === "newNames") {
        delete data.newNames[index]
      } else {
        data[type].splice(index, 1);
      }
      scheduleSave();
      socket.emit("allRequests", {reports: data.reports, players: data.players, skinRequests: data.skinRequests, mapRequests: data.mapRequests, contact: data.contact, newNames: data.newNames})
    } 
    
  })
  socket.on("findGame", ()=>{
      let availableGames = [];
      const gameTypes = ["tag", "laserTag", "infection"];
      gameTypes.forEach((gameType) => {
       
        Object.keys(game[gameType]).forEach((world) => {
          if (game[gameType][world] && world.split("-")[1] != "private" && !game[gameType][world].started) {
            availableGames.push({ gameType, world });
          }
        });
      });
      if(availableGames.length < 1 && (Object.keys(game.tag).length > 0 || Object.keys(game.laserTag).length > 0 || Object.keys(game.infection).length > 0)) {
        let shortestGame = null;
        let shortestTime = Infinity;
        gameTypes.forEach(gameType => {
          Object.keys(game[gameType]).forEach(world => {
            const currentGame = game[gameType][world];
            if (currentGame && currentGame.started && currentGame.timeLeft < shortestTime) {
              shortestTime = currentGame.timeLeft;
              shortestGame = gameType;
            }
          });
        });
        socket.emit("world", shortestGame);
      } else if(availableGames.length > 0) {
        let chosenGame = availableGames[Math.floor(Math.random() * availableGames.length)];
        socket.emit("world", chosenGame.gameType);
      } else {
        let randomGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
        socket.emit("world", randomGameType);
      }
  })
  socket.on("world", (stuff) => {
    console.log(stuff)
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
   if (stuff.world === "tag") {
      if(!stuff.map) stuff.map = "forest"
      if(!stuff.time) stuff.time = 60
      joinGameRoom(socket, stuff, "tag", () => startTag(socket.room), stuff.room, stuff.map, stuff.time);
    } else if(stuff.world === "laser tag") {
       if(!stuff.map) stuff.map = "forest"
      if(!stuff.time) stuff.time = 60;
      joinGameRoom(socket, stuff, "laserTag", () => startLaserTag(socket.room), stuff.room, stuff.map, stuff.time);
    } else if (stuff.world === "infection") {
      if(!stuff.map) stuff.map = "forest"
      if(!stuff.time) stuff.time = 60;
      joinGameRoom(socket, stuff, "infection", () => startInfection(socket.room), stuff.room, stuff.map, stuff.time);
    } else if(stuff.world === "racing") {
      if(!stuff.map) stuff.map = "test"
      if(!stuff.time) stuff.time = 60;
      joinGameRoom(socket, stuff, "racing", () => startRacing(socket.room), stuff.room, stuff.map, stuff.time);
    }
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
  if(!name) name = randomName()
  data.bannedNames.forEach((bannedName)=>{
    if(name.toLowerCase().includes(bannedName)) name = randomName()
  })
  let nameCounter = 1;
  console.log("changing name", name, playerId)
  Object.keys(data.players).forEach((key)=>{
      if(data.players[key].name && normalizeName(name).replace(/[0-9]/g, '') === normalizeName(data.players[key].name).replace(/[0-9]/g, '')) {
        nameCounter++
      }
    })
  if(nameCounter > 1) {
    name = name+nameCounter
  }
  socket.emit("change name", name)
    data.players[playerId].name = name
  if(!data.newNames) data.newNames = {}
    data.newNames[playerId] = name
    scheduleSave()
})
  socket.on("ban name", ({code, name})=>{
    let adcode = process.env.ADMINCODE || "spicy"
    if(code === adcode && name) {
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
  socket.on("player infected", (tagged)=>{
    const world = game.infection[socket.room];
    if(world && world.started && !world.infected.includes(tagged)) {
      world.infected.push(tagged)
      io.to(socket.room).emit("player infected", tagged);
      io.to(socket.room).emit("chat message", {
        message: `${data.players[tagged].name} was infected!`,
        id: "server",
        name: "server",
      });
      if(world.infected.length+1 == world.players.length) {
        clearInterval(world.intervalStart);
         let winner = data.players[world.players.filter((player)=>!world.infected.includes(player))[0]].name
        io.to(socket.room).emit("chat message", {
          message: `Ending the game because everyone but ${winner} was infected!`,
          id: "server",
          name: "server",
        })
        setTimeout(()=>{
          endGame(socket.room, "infection");
        }, 3000)

      }
    }
  })
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
    console.log("banned id", banData.id)
banId(banData.id, banData.time, banData.reason); 
  }
     
  }); 
socket.on("disconnecting", () => {
  disconnectPlayer(socket.playerId, socket.room)
  });
  function disconnectPlayer(playerId, world) {
    if (!socket.room) {
      return;
    }
    const gameType = world.split("-")[0]
    const gameworld = game[gameType][world]
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
      } else if(gameType === "infection" && gameworld.players.length > 2 && gameworld.started && gameworld.infected.length == 1 && gameworld.infected[0] === playerId) {
        const randomIndex = Math.floor(Math.random() * gameworld.players.length);
        gameworld.infected = [gameworld.players[randomIndex]]
        io.to(world).emit("player infected", gameworld.infected[0]);
        io.to(world).emit("chat message", {
          message: `${data.players[gameworld.infected[0]].name} is infected now!`,
          id: "server",
          name: "server",
        });
      } else if(gameType === "infection" && gameworld.started && gameworld.players.length < 3) {
        gameworld.started = false;
        clearInterval(gameworld.intervalStart);
        gameworld.intervalStart = undefined;
        gameworld.timeToStart = 30;
        endGame(world, gameType, true, true);
      }

      if (gameworld.players.length < 2) {
        gameworld.started = false;
        clearInterval(gameworld.intervalStart);
        gameworld.intervalStart = undefined;
        gameworld.timeToStart = 30;
        endGame(world, gameType, true);
      } 
    }
  }
  socket.on("disconnect", () => {
    disconnectPlayer(socket.playerId, socket.room)
});

});

