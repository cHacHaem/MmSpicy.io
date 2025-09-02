/* global io playerId */
const facts = ["Falling in the void during a laser tag game after being zapped will make you zapped out by the person who zapped you last.",
  "The Find Game feature searches for public games that haven't started yet, if there aren't any of those, it searches for the gamemode with games about to end.",
  "Old accounts are removed after 10 days.",
  "Create a new map in our <a href='/create/editor'>editor</a>. Learn how on our <a href='/create'>create page</a>. We're always looking for new maps!",
  "MmSpicy was designed with low-poly graphics to run relatively smoothly on almost any computer.",
  "Falling in the void during a tag game in the low gravity map will make you taggd.",
  "Type /report in the chat to report messages.",
  "You can report bugs, request new features, or say hi on our <a href='/contact'>contact page</a>.",
  "Press shift when running to get a 3 second boost. There is a 10 second cooldown though.",
  "Tree camping in the forest map will get you kicked.",
  "The best way to support MmSpicy io is to share the game!",
  "The rocks on the ground of the forest map change every game.",
  "Put ghost in your name to look like a ghost.",
  "You can set the time limit of a private game.",
  "You can request a skin in the skin menu.",
  "All of MmSpicy io's assets were made in <a href='https://blender.org/about/' style='color: lightblue'>blender</a>. (Minus the skins)",
  "Do people even read these?",
  "The first map was forest.",  "The first game mode was tag.",
  "A photoscan uses pictures of an object or place and uses some math no one should understand to turn it into a 3d model.",
  "A lot of the skins were ai generated.",
  "You can change your name at the bottom of this page.",
  "You can choose the map when making a private game.",
  "I used to say the phrase mm spicy when I thought something was cool. When it came to name this game something other than 'multiplayer tag game' and tag.io was already taken, mm spicy io was the result.",
  "pneumonoultramicroscopicsilicovolcanoconiosis",
  "screen-size",
];
let playerNameInput = document.getElementById("playerName");
let gameModeSelect = document.getElementById("gameModeSelect");
setInterval(setFact, 10000);
function setFact() {
  let fact = facts[Math.floor(Math.random() * facts.length)];
  while (fact == document.getElementById("facts").innerHTML) {
    fact = facts[Math.floor(Math.random() * facts.length)];
  }
  if (fact == "screen-size")
    fact = `Your screen is ${screen.width} by ${screen.height} pixels.`;
  document.getElementById("facts").innerHTML = fact;
}
setFact();
function changeName() {
  name = playerNameInput.value;
  if (name.length > 15) {
    name = name.substring(0, 15);
    playerNameInput.value = name;
  }
  socket.emit("change name", { playerId: playerId, name: name });
  socket.emit("leaderboard", gameModeSelect.value)
}
//joining games
function joinPrivateGame() {
  if (gameModeSelect.value === "random") {
    document.getElementById("joinPrivateTag").value = "SELECT A GAME MODE";
    return;
  }

  if (!document.getElementById("joinPrivateTag").value.includes("tag-private-"))
    window.location.href =
      "/" +
      gameModeSelect.value +
      "?join=private&privateroom=" +
      document.getElementById("joinPrivateTag").value;
  if (document.getElementById("joinPrivateTag").value.includes("tag-private-"))
    document.getElementById("joinPrivateTag").value = "JUST THE LETTERS";
}
function createPrivateGame() {
  if (gameModeSelect.value === "random") gameModeSelect.value = "tag";
  window.location.href =
    "/" +
    gameModeSelect.value +
    "?join=private&privateroom=create&map=" +
    document.getElementById("tagMapSelect").value +
    "&time=" +
    document.getElementById("tagTimeSelect").value;
}
function joinRandomGame() {
  if (gameModeSelect.value === "random") {
    socket.emit("findGame");
    socket.on("world", (world) => {
      if(world) window.location.href = `/${world}?join=random`;
      if(!world) window.location.href = `/tag?join=random`
    });
  } else {
    window.location.href = `/${gameModeSelect.value}?join=random`;
  }
}
//get stats
const socket = io();
function requestSkin() {
  if (
    document.getElementById("skinRequest").value != "" &&
    document.getElementById("skinRequest").value != "Request Sent"
  )
    socket.emit("skinRequest", {
      name: name,
      playerId: playerId,
      skin: document.getElementById("skinRequest").value,
    });
  socket.on("complete", () => {
    document.getElementById("skinRequest").value = "Request Sent";
  });
  socket.on("issue", () => {
    document.getElementById("skinRequest").value =
      "There was an issue sending your request";
  });
}
function changeGamemode() {
  socket.emit("leaderboard", gameModeSelect.value);
}
socket.emit("getName", playerId);
socket.on("getName", (name1) => {
  if (name1 && name1.name) {
    name = name1.name;
    playerNameInput.value = name;
  } else {
    playerNameInput.value = "";
    changeName();
  }
});
socket.emit("leaderboard", gameModeSelect.value);
socket.on("leaderboard", (players) => {
  console.log(players);
  const leaderboard = document.getElementById("leaderboard");
  let wins;
  leaderboard.innerHTML = "";
  if (gameModeSelect.value == "laserTag") {
    document.getElementById("leadText").textContent = "Laser Tag Leaderboard";
    wins = "laserTagWins";
  } else if (gameModeSelect.value == "tag") {
    document.getElementById("leadText").textContent = "Tag Leaderboard";
    wins = "tagWins";
  } else if (gameModeSelect.value == "infection") {
    document.getElementById("leadText").textContent = "Infection Leaderboard";
    wins = "infectionWins";
  } else {
    document.getElementById("leadText").textContent = "Overall Leaderboard";
    wins = "totalWins";
  }
  const sortedPlayers = Object.keys(players)
    .map((id) => ({
      id,
      name: players[id].name || id,
      wins: players[id][wins] ?? 0,
    }))
    .sort((a, b) => b.wins - a.wins);

  sortedPlayers.forEach((player, index) => {
      const row = document.createElement("h3");
      row.textContent = `${player.name} — Wins: ${player.wins}`;
      leaderboard.appendChild(row);
      row.className = "leaderboard-entry";
      if (index == 0) row.classList.add("gold-entry");
      if (index == 1) row.classList.add("silver-entry");
      if (index == 2) row.classList.add("bronze-entry");
  });
});
socket.on("change name", (name1) => {
  playerNameInput.value = name1;
  name = name1;
});
socket.on("customSkin", (url)=>{
  skin = url
  setSkin()
})
