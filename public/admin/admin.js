let socket = io();
let code = prompt("Admin Code");

socket.emit("gamesPlayed", code);
socket.on("gamesPlayed", (number) => {
  document.getElementById("played").innerHTML = number;
});
socket.emit("getAllRequests", code);
socket.on("allRequests", (requests) => {
  const container = document.getElementById("requests");
  container.innerHTML = ""; // Clear existing content

  // Skin Requests
  requests.reports.forEach((report, index) => {
    let reportCon = document.createElement("div")
    report.forEach((message)=>{
      let mes = document.createElement("h3");
      mes.textContent = message.id + " message: " + message.message
      reportCon.appendChild(mes)
    })
    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      socket.emit("removeRequest", {code: code, type: "reports", index: index})
    };
    container.appendChild(reportCon)
    container.appendChild(delBtn);
    container.appendChild(document.createElement("hr"));
  });
  requests.contact.forEach((contact, index) => {
    let id = document.createElement("h1");
    id.textContent = "Name: " + contact.name + " Email: " + contact.email + " Message:";
    
    let request = document.createElement("h3");
    request.textContent = contact.message;

    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      socket.emit("removeRequest", {code: code, type: "contact", index: index})
    };

    container.appendChild(id);
    container.appendChild(request);
    container.appendChild(delBtn);
    container.appendChild(document.createElement("hr"));
  });
  requests.skinRequests.forEach((skin, index) => {
    let id = document.createElement("h1");
    id.textContent = "Id: " + skin.playerId + " Skin:";
    
    let request = document.createElement("h3");
    request.textContent = skin.request;

    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      console.log("Delete skin request at index:", index, skin);
      socket.emit("removeRequest", {code: code, type: "skinRequests", index: index})
    };

    container.appendChild(id);
    container.appendChild(request);
    container.appendChild(delBtn);
    container.appendChild(document.createElement("hr"));
  });

  // Map Requests
  requests.mapRequests.forEach((map, index) => {
    let id = document.createElement("h1");
    id.innerHTML = "Id: " + map.playerId + " <b>Map:</b>";

    let request = document.createElement("h3");
    request.textContent = map.request;

    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
     socket.emit("removeRequest", {code: code, type: "mapRequests", index: index})
 
    };

    container.appendChild(id);
    container.appendChild(request);
    container.appendChild(delBtn);
    container.appendChild(document.createElement("hr"));
  });
});
function banName() {
  socket.emit("ban name", {code: code, name: document.getElementById("banName").value})
}
function banPlayer() {
  socket.emit("ban player", {code: code, id: document.getElementById("banId").value, time: document.getElementById("banTime").value, reason: document.getElementById("banReason").value})
}