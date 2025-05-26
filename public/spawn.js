/*global map*/
let player;
function sceneLoaded2() {



  reSpawn()

  setInterval(() => {
    if (player.getAttribute("position").y < -10) {
      player.removeAttribute("dynamic-body");
      reSpawn();
}})
  }
function reSpawn() {
  player = document.getElementById("player")
    if (map == "cave") {
 const spawnPositions = [
{x: 0, y: 1.0992760371886738, z: 0},
   {x: 5.7564341927466165, y: 4.069278139972162, z: 34.80967257733488},
   {x: -10.972415905894076, y: -1.4455331443167743, z: 62.012302432262},
   {x: -43.86776484512811, y: 1.0993106683450442, z: 31.14660103825478},
    {x: -31.069098824968716, y: 1.0993160410094724, z: 11.007674495269415},
   {x: -27.148331145932122, y: 1.0993173581986149, z: 3.3916827952489617}
];
const spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
  player.setAttribute("position", spawnPos);

    player.setAttribute("dynamic-body", {
      shape: "sphere",
      linearDamping: 0.9,
      angularDamping: 0.9
    });

    // Ensure physics body position is synchronized
    setTimeout(() => {
      if (player.body) {
        player.body.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
        player.body.velocity.set(0, 0, 0);
        player.body.angularVelocity.set(0, 0, 0);
      }
    }, 100);
    } else if (map == "forest") {
      const spawnPositions = [
{x: -39.19753874872109, y: 5.199230518374396, z: 36.68359198971971},
        {x: -30.99427469308113, y: 5.198985493142823, z: -5.510439582802567},
        {x: -21.27200949065786, y: 0.9992910253025457, z: -35.404904834168114},
        {x: -5.720488151533463, y: 5.199279582326446, z: -28.63087402582579},
        {x: 20.311347834714173, y: 5.199315083464298, z: -18.502839747153455},
        {x: 30.42346972387907, y: 4.555943230269487, z: -6.517701454775796},
         {x: 29.35550332545667, y: 5.199312073437973, z: 10.752077116087923},
         {x: 36.47283065836658, y: 5.199291461521425, z: 38.83593995994921},
        {x: 15.4495175629646, y: 4.759759202654578, z: 39.623658505330184},
        {x: 1.2953524060082193, y: 5.199290689424445, z: 31.705687363718873},
        {x: -9.271822428344949, y: 5.199289520399552, z: 25.023029902090947},
        {x: -34.824264976819116, y: 0.9992766463705042, z: 1.4736318702395022},
        {x: -8.222129769580082, y: 0.9992917604225566, z: -5.040939532059141},
         {x: 16.565687463638145, y: 0.9992920414617057, z: -6.622460630029001},
        {x: 18.782431352512774, y: 0.9992888547934988, z: 25.91760810544274},
        {x: -27.137405471794686, y: 0.9992784522141881, z: 27.261870140778115},
        {x: 2.579030078342313, y: 0.9992953564709164, z: -25.10748933012558}
];
const spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
  player.setAttribute("position", spawnPos);

    player.setAttribute("dynamic-body", {
      shape: "sphere",
      linearDamping: 0.9,
      angularDamping: 0.9
    });

    // Ensure physics body position is synchronized
    setTimeout(() => {
      if (player.body) {
        player.body.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
        player.body.velocity.set(0, 0, 0);
        player.body.angularVelocity.set(0, 0, 0);
      }
    }, 100);
    } else if(map == "school") {
      const spawnPositions = [
{x: -8.624332553501565, y: 0.9993259816400812, z: 50.76058065383363},
        {x: -72.22871849737618, y: 0.9993028805151184, z: 40.584025800556766},
        {x: -58.69263499962868, y: 0.999257690085119, z: -44.175693261577},
        {x: -22.597679962177793, y: 1.4992815831028021, z: -52.70233926486688},
        {x: 10.146409076722428, y: 1.499285212738713, z: -22.18410572991338},
        {x: 28.62486815477352, y: 0.9992893729097748, z: 17.87339140008932},
        {x: -4.380978977597751, y: 1.4992674203151781, z: 23.533292199735083},
        {x: -29.192671339732666, y: 1.4992935419474929, z: -19.32449492268582},
         {x: -19.808353068118766, y: 1.4992989360426108, z: 3.5680069325777533},
        {x: -0.7769920569165666, y: 7.599280805405002, z: 25.525027499360984},
        {x: -33.65794886465514, y: 7.599295328344432, z: -7.846843269566696},
        {x: -35.99716024521204, y: 1.499294267534957, z: -6.140705362391948}
];
const spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
  player.setAttribute("position", spawnPos);

    player.setAttribute("dynamic-body", {
      shape: "sphere",
      linearDamping: 0.9,
      angularDamping: 0.9
    });

    // Ensure physics body position is synchronized
    setTimeout(() => {
      if (player.body) {
        player.body.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
        player.body.velocity.set(0, 0, 0);
        player.body.angularVelocity.set(0, 0, 0);
      }
    }, 100);
      console.log(player.getAttribute("position"))
    } else if(map === "city") {
      const spawnPositions = [
        {x: 0, y: 3.799290015084451, z: 0},
        {x: -25.924106092454892, y: 1.4992816397773328, z: 29.44518033390695},
        {x: -26.443549716499234, y: 7.499294596050043, z: 28.809924824820772},
        {x: -24.4891582994054, y: 15.509296458126894, z: 31.018354538593492},
        {x: -27.904255019917265, y: 19.49928511138313, z: 26.233929704582167},
        {x: -36.17771473229255, y: 1.009261075386608, z: -0.9999263316869331},
         {x: -35.49319207497968, y: 2.559285456127935, z: -23.848876215025605},
        {x: -45.69571366521448, y: 2.559266795758817, z: -44.4986846965054},
        {x: -26.661229649712958, y: 1.6092897964512887, z: -32.91892792488566},
         {x: 23.352738571574683, y: 1.4993071212619644, z: 31.624137332750504},
        {x: 30.503196301782477, y: 1.4993174498522641, z: 31.782735442941927},
        {x: 27.588882896747243, y: 1.499297672242556, z: 17.650792730601783},
        {x: 25.28667898371267, y: 1.4992915269821947, z: -26.92918268523083},
        {x: 15.549377219043375, y: 2.9919073543104484, z: -16.248962000787284},
        {x: 24.35321145552055, y: 7.499289065951105, z: -33.66584433424545},
        {x: 24.181549399877614, y: 13.49928905547444, z: -25.43197116109656},
        {x: 21.829044378351266, y: 19.49931943462263, z: -26.07011907203851},
        {x: -0.8378140508478542, y: 1.009296754574149, z: 29.033645479289266},
        {x: -18.04399628785564, y: 1.0092898553936194, z: 0.8858478185662294},
        {x: -5.688651037314301, y: 3.799290557729943, z: -32.520608702516554}
      ]
      const spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
  player.setAttribute("position", spawnPos);

    player.setAttribute("dynamic-body", {
      shape: "sphere",
      linearDamping: 0.9,
      angularDamping: 0.9
    });

    // Ensure physics body position is synchronized
    setTimeout(() => {
      if (player.body) {
        player.body.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
        player.body.velocity.set(0, 0, 0);
        player.body.angularVelocity.set(0, 0, 0);
      }
    }, 100);
    } else {
      player.setAttribute("position", {x: 0, y: 32, z: 0});
    }

    player.setAttribute("dynamic-body", {
      shape: "sphere",
      linearDamping: 0.9,
      angularDamping: 0.9
    });
  }