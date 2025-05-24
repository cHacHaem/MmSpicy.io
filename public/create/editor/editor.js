/* global CodeMirror io playerId */
let socket = io();
let codeSent = false;
let autoRefresh = document.getElementById("autoRefresh")
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
 mode: "htmlmixed",
  lineNumbers: true,
  lineWrapping: true,
  tabSize: 2,
  indentUnit: 2,
  autoCloseTags: true,
  autoCloseBrackets: true,
  extraKeys: {
    "Ctrl-Space": "autocomplete"
  }
});

if(localStorage.getItem("currentMapCode") && localStorage.getItem("currentMapCode") != "reset") {
  editor.setValue(localStorage.getItem("currentMapCode"));
}
update(); 
function update() {
  var iframe = document.getElementById("result");
  var content = editor.getValue(); 
  iframe.srcdoc = content; 
  localStorage.setItem("currentMapCode", content)
}
function download() {
   const htmlContent = editor.getValue();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();

    URL.revokeObjectURL(url);
}
function requestMap() {
  if(!codeSent) {
    socket.emit("mapRequest", {playerId: playerId, mapCode: editor.getValue()})
  socket.on("complete", ()=>{
    codeSent = true;
    document.getElementById("result").srcdoc = "<h1 style='color: green'>Your map has been sent in for review. If it is appropriate, quality, and original, we might add it.</h1>"
  })
  socket.on("issue", ()=>{
    document.getElementById("result").srcdoc = "<h1 style='color: red'>There was a problem saving your map. Try again some other time.</h1>"
  })
    
  }
  
}
function reset() {
  if(prompt("Are you sure you want to go back to the original code? Type yes to delete all your progress.") == "yes") {
    localStorage.setItem("currentMapCode", "reset")
  window.location.href="/create/editor"
  }

}

editor.on("change", ()=>{
  if(autoRefresh.checked) update();
});