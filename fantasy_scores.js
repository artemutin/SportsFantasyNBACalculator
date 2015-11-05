//DOM change listener, taken from https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
var observeDOM = (function(){
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
      eventListenerSupported = window.addEventListener;

  return function(obj, callback){
      if( MutationObserver ){
          // define a new observer
          var obs = new MutationObserver(function(mutations, observer){
              if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                  callback();
          });
          // have the observer observe foo for changes in children
          obs.observe( obj, { childList:true, subtree:true });
      }
      else if( eventListenerSupported ){
          obj.addEventListener('DOMNodeInserted', callback, false);
          obj.addEventListener('DOMNodeRemoved', callback, false);
      }
  }
})();
var changeFlag = false
// On change inside box scores, recalculate Fantasy Points
observeDOM( document.getElementById('nbaGIboxscore') , updateFantasyScores);
updateFantasyScores()

function updateFantasyScores(){
  if (changeFlag){
    //it was our own DOM update, so no infinite loops, please=)
    changeFlag = false
    return
  }
  changeFlag = true
  //find two team's stat tables
  var tables = document.querySelectorAll("#nbaGITeamStats")
  if (tables.length == 2){
    //let's get a score of match
    var home = +document.getElementsByClassName("teamHome")[0].innerHTML
    var away = +document.getElementsByClassName("teamAway")[0].innerHTML
    for (var i = 0; i < 2; ++i){
      //calculate win-loss modifier
      //first table for away, second for home team
      var winLossMod = 0
      if (home != away){//handling tie as no mods applied
        if (i == 0){
            winLossMod = away > home ? 3 : -2
          }else{
            winLossMod = home > away ? 2 : -3
          }
      }
      //get rows
      var table = tables.item(i) 
      var rows = table.getElementsByTagName("tr")
      if (rows.length > 2){
        //insert column header
        var td = document.createElement("td")
        td.innerHTML = "ФО" 
        rows[2].appendChild(td)
        //for every player's stats row
        for (var j = 3; j < rows.length-2; ++j){
          var row = rows[j]
          var columns = row.children
          if (columns.length < 10){
            //something wrong - columns is not set properly
            continue
          }
          //fantasy points, rules from http://www.sports.ru/fantasy/basketball/tournament/rules/150.html
          var FO = winLossMod
          var splitCol = function(col, splitChar){
            return columns[col].innerHTML.split(splitChar).map(function(elm){
              return +elm
            })
          }
          //time points
          var stat = splitCol(2, ":")
          if (stat[0] > 0 || stat[1] > 0){
            FO += 1
            if (stat[0] >= 10){
              FO += 1
            }
          }       
          //two-pointers + three-pointers. No need to use of separate 3-point column
          stat = splitCol(3, "-")
          FO += (stat[0] - stat[1])
          //free-throws
          stat = splitCol(5, "-")
          FO += (stat[0] - stat[1])
          //rebounds
          FO += +columns[9].innerHTML
          //assists
          FO += +columns[10].innerHTML
          //fouls
          FO -= +columns[11].innerHTML
          //steals
          FO += +columns[12].innerHTML
          //turnovers
          FO -= 2*(+columns[13].innerHTML)
          //blockshots
          FO += +columns[14].innerHTML
          //scored points
          FO += +columns[16].innerHTML

          //insert a column with fantasy points
          if (FO == FO){//not NaN
            var td = document.createElement("td")
            td.innerHTML = FO
            row.appendChild(td) 
          }   
        }
      } 
    }
  }
} 
