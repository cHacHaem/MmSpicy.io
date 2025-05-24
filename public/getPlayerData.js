let playerId, name, skin;
if (localStorage.getItem('playerId')) {
  playerId = localStorage.getItem('playerId');
} else {
  playerId = generateRandomString(20);
  localStorage.setItem("playerId", playerId);
}

if (localStorage.getItem('skin')) {
  skin = localStorage.getItem('skin');
} else {
  skin = "https://cdn.glitch.global/756a4aaf-b43f-4a95-998c-1c3ac912e721/Sweatshirt.glb?v=1725725228968"
  localStorage.setItem("skin", skin);
}
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}