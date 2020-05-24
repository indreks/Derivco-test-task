
const logging = true;
const addWinsToBalance = true;
const startingBalance = 100;
const minBalance = 1;
const maxBalance = 5000;
const delayBetweenReels = 0.5;
const spinDuration = 2;


const positions = ['top', 'center', 'bottom'];
const reelSymbols = ['bar3', 'empty1', 'bar1', 'empty2', 'bar2', 'empty3', '7', 'empty4', 'cherry', 'empty5'];
const minFullSpins = 2;
const symbolHeight = 60;
var reelHeight = reelSymbols.length * symbolHeight;
var fixedMode = false;

var inputElement = $("#balance");
inputElement.val(startingBalance);

var spinButton = $("#spin-button");
var debugArea = $("#debug");

var reel1 = $("#reel1");
var reel2 = $("#reel2");
var reel3 = $("#reel3");
reel1.currentTop = 0;
reel2.currentTop = 0;
reel3.currentTop = 0;

var winConditions = [
   {
     symbols: ['cherry', 'cherry', 'cherry'],
     position: 'top',
     winnings: 2000,
     textObjId: '#win-cherry-top'
   },
   {
     symbols: ['cherry', 'cherry', 'cherry'],
     position: 'center',
     winnings: 1000,
     textObjId: '#win-cherry-center'
   },
   {
     symbols: ['cherry', 'cherry', 'cherry'],
     position: 'bottom',
     winnings: 4000,
     textObjId: '#win-cherry-bottom'
   },
   {
     symbols: ['7', '7', '7'],
     position: 'any',
     winnings: 150,
     textObjId: '#win-7'
   },
   {
     symbols: [['7', 'cherry'], ['7', 'cherry'], ['7', 'cherry']],
     position: 'any',
     winnings: 75,
     textObjId: '#win-7-or-cherry'
   },
   {
     symbols: ['bar3', 'bar3', 'bar3'],
     position: 'any',
     winnings: 50,
     textObjId: '#win-3bar'
   },
   {
     symbols: ['bar2', 'bar2', 'bar2'],
     position: 'any',
     winnings: 20,
     textObjId: '#win-2bar'
   },
   {
     symbols: ['bar1', 'bar1', 'bar1'],
     position: 'any',
     winnings: 10,
     textObjId: '#win-1bar'
   },
   {
     symbols: [['bar1', 'bar2', 'bar3'], ['bar1', 'bar2', 'bar3'], ['bar1', 'bar2', 'bar3']],
     position: 'any',
     winnings: 5,
     textObjId: '#win-any-bar'
   }
];


//random mode selected
$("#random-mode").click(function() {

  $('#fixed-mode-menu').css({'display': 'none'});
  fixedMode = false;
  log('Switched to RANDOM mode');
});


//fixed mode selected
$("#fixed-mode").click(function() {

  $('#fixed-mode-menu').css({'display': 'flex'});
  fixedMode = true;
  log('Switched to FIXED mode');
});


//listen to balance input changes
inputElement.keyup(function(e) {

  var inputValue = parseInt($(this).val());

  if(isNaN(inputValue)) {
    log('Inserted balance invalid or NaN');
    $(this).val('');
  }
  else if(inputValue < minBalance) {
    $(this).val(minBalance);
    log('Inserted balance under ' + minBalance +', balance set to ' + minBalance);
  }
  else if(inputValue > maxBalance) {
    $(this).val(maxBalance);
    log('Inserted balance is over ' + maxBalance +', balance set to ' + maxBalance);
  }
  else {
    log('Balance set to ' + inputValue);
  }
});



spinButton.click(function() {

  log('Spin button clicked');

  setWinLine('remove');

  for(var i = 0; i < winConditions.length; i++) {
    $(winConditions[i].textObjId).removeClass('blinking');
  }

  if(inputElement.val() > 0) {

    inputElement.val(parseInt(inputElement.val()) - 1);    

    var newPosReel1 = reelSymbols.length * minFullSpins + Math.floor(Math.random() * reelSymbols.length) + 1;
    var newPosReel2 = reelSymbols.length * minFullSpins + Math.floor(Math.random() * reelSymbols.length) + 1;
    var newPosReel3 = reelSymbols.length * minFullSpins + Math.floor(Math.random() * reelSymbols.length) + 1;

    if(fixedMode) {

      //get selected symbols
      var selectedSymbol1 = document.getElementById("fixed-reel-symbol1");
      var selectedSymbol2 = document.getElementById("fixed-reel-symbol2");
      var selectedSymbol3 = document.getElementById("fixed-reel-symbol3");
      var fixedSymbol1 = selectedSymbol1.options[selectedSymbol1.selectedIndex].value;
      var fixedSymbol2 = selectedSymbol2.options[selectedSymbol2.selectedIndex].value;
      var fixedSymbol3 = selectedSymbol3.options[selectedSymbol3.selectedIndex].value;

      //get selected positions
      var fixedReelPos1 = parseInt($('input[name="reel1-pos"]:checked').val());
      var fixedReelPos2 = parseInt($('input[name="reel2-pos"]:checked').val());
      var fixedReelPos3 = parseInt($('input[name="reel3-pos"]:checked').val());

      //set positions to hit
      newPosReel1 = reelSymbols.length * minFullSpins + (reelSymbols.length - 2 * fixedSymbol1 + fixedReelPos1);
      newPosReel2 = reelSymbols.length * minFullSpins + (reelSymbols.length - 2 * fixedSymbol2 + fixedReelPos2);
      newPosReel3 = reelSymbols.length * minFullSpins + (reelSymbols.length - 2 * fixedSymbol3 + fixedReelPos3);
    }
    
    //animate
    gsap.fromTo(reel1, spinDuration, {y: getTransformYById(reel1.attr('id'))}, {y: newPosReel1 * symbolHeight, onUpdate: reelViewUpdate, onUpdateParams: [reel1]});
    gsap.fromTo(reel2, spinDuration, {y: getTransformYById(reel2.attr('id'))}, {delay: delayBetweenReels, y: newPosReel2 * symbolHeight, onUpdate: reelViewUpdate, onUpdateParams: [reel2]});
    gsap.fromTo(reel3, spinDuration, {y: getTransformYById(reel3.attr('id'))}, {delay: delayBetweenReels * 2, y: newPosReel3 * symbolHeight, onUpdate: reelViewUpdate, onUpdateParams: [reel3], onComplete: spinDone});
    
    //disable interactions
    spinButton.prop('disabled', true);
    inputElement.prop('disabled', true);

    log('Spinning reels');
  }
  else {
    log('Not enough balance to play');
    inputElement.val(0);
  }
});


//get y position from transform: translate
function getTransformYById(objId) {

  var compStyle = getComputedStyle( document.getElementById(objId), '');
  var matrix = new WebKitCSSMatrix(compStyle.webkitTransform);
  return matrix.m42;
}


//adjust reel image y position when it would go out of its area
function reelViewUpdate(reel) {

  var currentY = getTransformYById(reel.attr('id'));
  var currentTop = reel.css('top');

  if(currentY + reel.currentTop > 0) {

    reel.currentTop -= reelHeight;

      reel.css({
        top: reel.currentTop + 'px'
      });
  }
}


//called after a spin has finished
function spinDone() {

  log('Spin finished');

  //reset reel container y positions
  reelPosCleanup(reel1);
  reelPosCleanup(reel2);
  reelPosCleanup(reel3);

  checkWins();

  //enable interactions
  spinButton.prop('disabled', false);
  inputElement.prop('disabled', false);
}



function checkWins() {

  //get hit symbols
  var reelSymbols1 = getResultSymbol(reel1);
  var reelSymbols2 = getResultSymbol(reel2);
  var reelSymbols3 = getResultSymbol(reel3);

  for(var i = 0; i < positions.length; i++) {

    for(var j = 0; j < winConditions.length; j++) {

      if(positions[i] == winConditions[j].position || winConditions[j].position == 'any') {

        if(checkSymbolMatch(reelSymbols1[positions[i]], winConditions[j].symbols[0]) &&
           checkSymbolMatch(reelSymbols2[positions[i]], winConditions[j].symbols[1]) &&
           checkSymbolMatch(reelSymbols3[positions[i]], winConditions[j].symbols[2])) {

          //win

          setWinLine(positions[i]);
          $(winConditions[j].textObjId).addClass('blinking');
          log('You won! Combination: ' + reelSymbols1[positions[i]] + ',' + reelSymbols2[positions[i]] + ',' + reelSymbols3[positions[i]] +
              '; position: ' + positions[i] + '; winnings: ' + winConditions[j].winnings);

          if(addWinsToBalance) {

            var balance = parseInt(inputElement.val());

            if(isNaN(balance)) {
              balance = 0;
            }

            balance += winConditions[j].winnings;
            inputElement.val(balance);
          }
          break;
        }
      }
    }
  }
}


//check if a hit symbol matches a win condition symbol
function checkSymbolMatch(reelSymbol, winConditionSymbols) {

  if(!Array.isArray(winConditionSymbols)) {
    winConditionSymbols = [winConditionSymbols];
  }

  for(var i = 0; i < winConditionSymbols.length; i++) {

    if(reelSymbol == winConditionSymbols[i]) {
      return true;
    }
  }

  return false;
}


//get the hit symbols of a reel
function getResultSymbol(reel) {

  var resultNr = getTransformYById(reel.attr('id')) / symbolHeight;
  var locTop = reelSymbols.length - resultNr;
  var locCenter = reelSymbols.length - resultNr + 1;
  var locBottom = reelSymbols.length - resultNr + 2;

  locTop = locTop % reelSymbols.length;
  locCenter = locCenter % reelSymbols.length;
  locBottom = locBottom % reelSymbols.length;

  return {
    top: reelSymbols[locTop],
    center: reelSymbols[locCenter],
    bottom: reelSymbols[locBottom],
  }
}


//reset reel container y position
function reelPosCleanup(reel) {

  if(reel.currentTop <= -reelHeight) {

    var stepBacks = Math.floor((Math.abs(reel.currentTop)) / reelHeight);

    reel.currentTop = reel.currentTop + stepBacks * reelHeight;

    reel.css({
      top: reel.currentTop + 'px',
      transform: 'translate(0px, ' + (getTransformYById(reel.attr('id')) - stepBacks * reelHeight) + 'px)'
    });
  }
}


//show/hide winning lines on rows
function setWinLine(position) {

  switch(position) {

    case positions[0]:
      $('#top-line').css({'opacity': 1});
      break;

    case positions[1]:
      $('#center-line').css({'opacity': 1});
      break;

    case positions[2]:
      $('#bottom-line').css({'opacity': 1});
      break;

    default:
      $('.win-line').css({'opacity': 0});
  }
}


//log to debug and console
function log(logText) {

  if(logging) {

    console.log(logText);
    debugArea.val(debugArea.val() + '\n' + logText);
    debugArea.scrollTop(debugArea[0].scrollHeight); 
  }
}