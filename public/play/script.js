/* global io playerId */
const facts = ["Type /report in the chat to report messages.", "You can report bugs, request new features, or say hi on our <a href='/contact'>contact page</a>.", "Press shift when running to get a 3 second boost. There is a 10 second cooldown though.", "Tree camping in the forest map will get you kicked.", "The best way to support MmSpicy io is to share the game!", "The rocks on the ground of the forest map change every game.", "Name yourself ghost to look like a ghost.", "You can set the time limit of a private game.", "You can request a skin in the skin menu.", "All of MmSpicy io's assets were made in <a href='https://blender.org/about/' style='color: lightblue'>blender</a>. (Minus the skins)", "Do people even read these?", "The first map was forest.", "A photoscan uses pictures of an object or place and uses some math no one should understand to turn it into a 3d model.", "A lot of the skins were ai generated.", "You can change your name at the bottom of this page.", "You can choose the map when making a private game.", "I used to say the phrase mm spicy when I thought something was cool. When it came to name this game something other than 'multiplayer tag game' and tag.io was already taken, mm spicy io was the result.", "pneumonoultramicroscopicsilicovolcanoconiosis", "screen-size"]
let playerNameInput = document.getElementById("playerName")
let gameModeSelect = document.getElementById("gameModeSelect")
setInterval(setFact, 10000)
function setFact() {
  let fact = facts[Math.floor(Math.random() * facts.length)]
  while(fact == document.getElementById("facts").innerHTML) {
    fact = facts[Math.floor(Math.random() * facts.length)]
  }
  if(fact == "screen-size") fact = `Your screen is ${screen.width} by ${screen.height} pixels.`;
  document.getElementById("facts").innerHTML = fact
}
setFact()
function changeGamemode() {
  
  if(gameModeSelect.value == "laserTag") {
    document.getElementById("tagMapSelect").innerHTML = `<option value="forest">Forest</option>`
  } else {
    document.getElementById("tagMapSelect").innerHTML = `<option value="city">City</option><option value="forest">Forest</option><option value="cave">Cave</option><option value="school">School</option>`
  }
}
function changeName() {
  name = playerNameInput.value
  if(name.length > 15) {
    name = name.substring(0, 15);
    playerNameInput.value = name;
  }
  socket.emit("change name", {playerId: playerId, name: name})
}
//joining games
function joinPrivateTagGame() {
  if(!document.getElementById("joinPrivateTag").value.includes("tag-private-"))   window.location.href = "/"+gameModeSelect.value+"?join=private&privateroom=" + document.getElementById("joinPrivateTag").value
  if(document.getElementById("joinPrivateTag").value.includes("tag-private-")) document.getElementById("joinPrivateTag").value = "JUST THE LETTERS"
        }
function createPrivateTagGame() {
      window.location.href = "/"+gameModeSelect.value+"?join=private&privateroom=create&map=" + document.getElementById("tagMapSelect").value + "&time=" + document.getElementById("tagTimeSelect").value
    }
function joinRandomTagGame() {
  window.location.href = `/${gameModeSelect.value}?join=random`
}
//get stats
const socket = io();
function requestSkin() {
  if(document.getElementById("skinRequest").value != "" && document.getElementById("skinRequest").value != "Request Sent") socket.emit("skinRequest", {name: name, playerId: playerId, skin: document.getElementById("skinRequest").value})
  socket.on("complete", ()=>{
    document.getElementById("skinRequest").value = "Request Sent"
  })
  socket.on("issue", ()=>{
    document.getElementById("skinRequest").value = "There was an issue sending your request"
  })
}
socket.emit("leaderboard")
socket.on("leaderboard", (players)=>{
  if(players[playerId]) {
    playerNameInput.value = players[playerId].name;
  } else {
    playerNameInput.value = `${(a=>a[Math.floor(Math.random()*a.length)])(['Dark','Silent','Lonely','Shining','Secret','Fun','Excited','Happy','Spicy'])} ${(b=>b[Math.floor(Math.random()*b.length)])(['Glitch','Frog','Bear','Pepper','io game'])}`
  changeName()
  }
  const leaderboard = document.getElementById("leaderboard");

const sortedPlayers = Object.keys(players)
  .map(id => ({
    id,
    name: players[id].name || id, 
    tagWins: players[id].tagWins ?? 0
  }))
  .sort((a, b) => b.tagWins - a.tagWins);

sortedPlayers.forEach((player, index) => {
  if(player.tagWins > 0) {
    const row = document.createElement("h3");
  row.textContent = `${player.name} — Wins: ${player.tagWins}`;
  leaderboard.appendChild(row);
  row.className = "leaderboard-entry";
  if(index == 0) row.classList.add("gold-entry")
  if(index == 1) row.classList.add("silver-entry")
  if(index == 2) row.classList.add("bronze-entry")
  }
});

})
socket.on("change name", (name1)=>{
   playerNameInput.value = name1
  name = name1
})