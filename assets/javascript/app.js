// Author: Nigel Finley. August 2016. UT Bootcamp RPS-Multiplayer Assisgnment
// Title will be BATTLE OF THE BANDS (then a sound could play based on who the winner is)
// Goal: To have music rockstars battle each other similar to rock paper scissors
// Rules of the game (put up in a modal before play (or have on the side). Get Gif images for each band
// Beatles = paper; Rolling Stones = Sciccors and Zepplin = Rock
// Beatles beats zepplin but loses to RS
// RS beats beatles but loses Zeppling
// Zepplin beats RS but loses to Beatles



  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBrOyxOEWRYL90-0_Baxk9FCGuDpDVbAsg",
    authDomain: "rps-multiplayer-game-1f69a.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-game-1f69a.firebaseio.com",
    storageBucket: "",
  };
  firebase.initializeApp(config);

  var db = firebase.database();




// MAIN GAME OBJECT

rps ={


// =========Variables============

  // Audio directory
  audioDir: "assets/audio/",
  // Initialize the scoring variables: these will be displayed on the page
  winsP1: 0,
  winsP2: 0,
  lossesP1: 0,
  lossesP2: 0,

  // Player variables
  playerId: 0,
  player1name: "",
  player2name: "",
  playerName: "",
  
  // Initialize the variable to store the user choice
  choiceP1: "",
  choiceP2: "",

  // Database variables : information that will be updated in the database
  openP1: true, 
  openP2: true,
  canPlay: true,
  numWins: 0,
  numLosses: 0,

  // Game over variables
  winnerMsg: "",
  // This number determines which player has won (ie. if 1 player one wins or 0 if tie)
  winningHand: 0,

  // Audio initial state
  playTrack: true, 



  // playerLeft: $('#playerLeft'),
  // playerRight: $('#playerRight'),



// ============Functions===========

// ======== CHAT FUNCTIONS ===========
//Clear the chat box in firebase when joining a game
emptyChat: function(){
  db.ref().child("chat").set({line:""});
},
// This takes the user input and puts it in firebase and also displays it on the page
inputChat: function(){
  var userMessage="";
  db.ref().child("chat").on("child_changed", function(snapshot) {

  if(snapshot.exists()){
        var chatObj = snapshot.val();

        if(chatObj !==""){
          $("#chatBox").append(chatObj+'\n');
          $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
          // console.log(chatObj);
        }
      }
  });
},

// This function takes the user chat input and puts it in firebase
writeChat: function(chat){
  var lineMessage = {line: chat};
  db.ref('chat/').update(lineMessage);
}, 


// ========= DATABASE Player Check and Add functions ===========
//checks for current players in atabase
checkforPlayers: function(){

  // This checks to see what positions are open and then adds 
  db.ref().child("player").on("child_added", function(snapshot) {

     if(snapshot.val().seat === 1){
      $("#nameOne").html(snapshot.val().name);
      rps.openP1=false;
       
     }

     else if(snapshot.val().seat === 2){
      $("#nameTwo").html(snapshot.val().name);
      rps.openP2=false;
     }

  });
},

//Check for availble game seats and if open add the player
// For a refactor exersice update this code to a swtich statement
addPlayer: function(currentPlayer, seatNum){
  var dbInput = db.ref().child("player");
  if((rps.openP1  || rps.openP2) && rps.canPlay){
    
    if(rps.openP1  && rps.openP2 && seatNum ===1){
      dbInput.update({ 1: {
              name: currentPlayer,
              wins: 0,
              losses: 0,
              seat:1,
            }});
      rps.playerId=1;
    }

    else if(rps.openP1  && rps.openP2 && seatNum ===2){
      dbInput.update({ 2: {
              name: currentPlayer,
              wins: 0,
              losses: 0,
              seat:2,
            }});
      rps.playerId=2;
    }

    else if(rps.openP1  && !rps.openP2){
      dbInput.update({ 1: {
              name: currentPlayer,
              wins: 0,
              losses: 0,
              seat:1,
            }});
      rps.playerId=1;
    }

    else if(rps.openP2 && !rps.openP1){
      dbInput.update({ 2: {
              name: currentPlayer,
              wins: 0,
              losses: 0,
              seat:2,
             
            }});
      rps.playerId=2;
    }

    //Setup player conditions
    rps.playerName=currentPlayer;
    rps.userConnect(rps.playerName);
    rps.userDisconnect(rps.playerId);
    rps.canPlay = false;
  }

  else if(!rps.canPlay && rps.playerId>0){
    alert("You are already playing");
  }

  else{
    alert("Game Full!");
  }
},

// ============ User connect and Disconnect Functions ============
 //Connect and Disconnect from firebase
 userConnect: function(name){
  db.ref().child(".info").on("child_added", function(snapshot) {
      if (snapshot.val() === true) {
        rps.writeChat(name+" has entered the game!");
      } 
  });
},
userDisconnect: function(number){
  db.ref().child("chat").onDisconnect().update({line: rps.playerName+" has left the game!"});
  db.ref().child("player").child(rps.playerId).onDisconnect().remove();
  rps.removeInfo();
},

  //When a player leaves remove character info from game
 removeInfo: function(){
    db.ref().child("player").on("child_removed", function(snapshot) {

      var seatNumber = snapshot.val().seat;

       if(seatNumber === 1){
        $("#nameOne").html("Waiting for Player to Join");
        $("#p1Score").html("Wins: 0 Losses: 0");
        this.playerLeave(seatNumber);
       }

       else if(seatNumber === 2){
        $("#nameTwo").html("Waiting for Player to Join");
        $("#p2Score").html("Wins: 0 Losses: 0");
         this.playerLeave(seatNumber);
       }
    });
 },

 playerLeave: function(seatNumber) {
  if(seatNumber===1){
    openPlayerOne=true;
  }
  else{
    openPlayerTwo=true;
  }
 },

 //========CHECK Player SCORES in FIREBASE ==============
checkScore: function(){

  db.ref().child("player").on("child_changed", function(snapshot) {
    if(snapshot.val().seat === 1){
      winsP1 = snapshot.val().wins;
      lossesP1 = snapshot.val().losses;
    }
    else if (snapshot.val().seat === 2){
      winsP2 = snapshot.val().wins;
      lossesP2 = snapshot.val().losses;
    }

  });
}

  // function checkWinner(){
  //     if (playerLeft && playerRight){

  //       if((playerLeft === rockOne) & (playerRight ====paperTwo)) {
  //         $('#gameStatus').html("Player One Wins!");   
  //       console.log("The playerLeft click" + playerLeft + "The playerRight click" + playerRight);
// USE A SWITCH STATEMENT FOR THIS
  // if (player1 && player2) {
  //           if ((player1 == 'r') && (player2 == 's')) {
  //               $('#gameStatus').html(player1name + " wins with Rock!");
  //               wins1++;
  //               losses2++;
  //           } else if ((player1 == 'r') && (player2 == 'p')) {
  //               $('#gameStatus').html(player2name + " wins with Paper!");
  //               losses1++;
  //               wins2++;
  //           } else if ((player1 == 's') && (player2 == 'r')) {
  //               $('#gameStatus').html(player2name + " wins with Rock!");
  //               losses1++;
  //               wins2++;
  //           } else if ((player1 == 's') && (player2 == 'p')) {
  //               $('#gameStatus').html(player1name + " wins with Scissors!");
  //               wins1++;
  //               losses2++;
  //           } else if ((player1 == 'p') && (player2 == 'r')) {
  //               $('#gameStatus').html(player1name + " wins with Paper!");
  //               wins1++;
  //               losses2++;
  //           } else if ((player1 == 'p') && (player2 == 's')) {
  //               $('#gameStatus').html(player2name + " wins with Scissors!");
  //               losses1++;
  //               wins2++;
  //           } else if (player1 == player2) {
  //               $('#gameStatus').html("It's a Tie!");
  //               ties1++;
  //               ties2++;
  //           }

  //       }
  //     }

  // }


}









// ============== RUN THE GAME =================

$(document).ready(function (){

  $('#playerName').on('click', function(){
    $(this).val("");

  })

  rps.emptyChat();
  rps.checkforPlayers();
  rps.inputChat();
  rps.checkScore();
  // checkResult();
  
  $("#myModal").modal('show');
});

// ===========================================

//Send messages by click
$(document).on('click', '#sendText', function(){
  var userMessage = $("#chatText").val();
  rps.writeChat(userMessage);
  $("#chatText").val("");

});

$('#modalButton').on('click', function(){
    if($('#playerName').val() !=="" && "Enter Your Name" !== $('#playerName').val()){
        rps.playerName = $("#playerName").val();
    }; 
    if(rps.openP1){
      $('#nameOne').html(rps.playerName);
      rps.addPlayer(rps.playerName, 1);
    }
    else if (rps.openP2){
      $('#nameTwo').html(rps.playerName);
      rps.addPlayer(rps.playerName, 2);
      
    }

    else { 
      alert("Game is currently Full! Check back later!");
    }

});

$('.playerSelection').on('click', function(){
  var choice = $(this).data("name");
  console.log(choice);

});

  // // on('click', function (){

  //   var playerName = $('#playerName').val().trim();
  //   // $('#nameOne').html(playerName); 
  //   // $('#nameTwo').html(playerName); 

  //   var nameOne = $('#nameOne');
  //   var nameTwo = $('#nameTwo');
  //   if(nameOne.val() != "") {
  //     console.log(nameOne.val());
  //     nameOne.html(playerName);
  //   }else {
  //     nameTwo.html(playerName);
  //   }

  //   console.log(playerName);






  
// FIREBASE



  // Logic to see if there are players present or not
  // db.ref().child('players').update({ 
  //   1: {
  //             dbPlayerName: playerName,
  //             dbWins: rps.winsTwo, 
  //             dbLosses: rps.lossesTwo
  //           }
  //       }); 
  //   playerId = 1;


// Only use snapshot to look to see if something exists not to actually update the information
  // db.ref().on("child_added", function (snapshot) {
  //       console.log(snapshot);

  //   if (snapshot.exists()) {
  //       playerOne = snapshot.val().playerOne;
  //       playerTwo = snapshot.val().playerTwo;
  //       console.log(playerOne, playerTwo);
  //       // checkWinner();
  //   }
  // });

// For Player One
    // db.ref().on("child_added", function (snapshot) {
    //   if(snapshot.child('players/playerOne').exists()){
    //     console.log("This is a console log: " + snapshot);
    //     db.ref('players').update({
    //         playerTwo: {
    //           dbPlayerName: playerName,
    //           dbWins: rps.winsTwo, 
    //           dbLosses: rps.lossesTwo
    //         }
    //       });
    //   }
    //   else {

    //    db.ref().child('players').set({
    //               playerOne: {
    //                 dbPlayerName: playerName,
    //                 dbWins: rps.winsOne, 
    //                 dbLosses: rps.lossesOne
    //               }
    //           });
    //   }
// This is the funtion to remove the 
    // db.ref().child('players').onDisconnect().remove({
    //         playerOne: {
    //           dbPlayerName: playerName,
    //           dbWins: rps.winsOne, 
    //           dbLosses: rps.lossesOne
    //         }
    //     });




    // db.ref().on("value", function (snapshot) {
    //   if(snapshot.child('players').exists()){
    //     db.ref('players/').update({
    //       playerTwo: {
    //         dbPlayerName: playerName,
    //         dbWins: rps.winsTwo, 
    //         dbLosses: rps.lossesTwo
    //       }
    //     });
    //     // Add html to the page

    //   } else {

    //     db.ref().set({
    //       players: {
    //         playerOne: {
    //           dbPlayerName: playerName,
    //           dbWins: rps.winsOne, 
    //           dbLosses: rps.lossesOne
    //         }
    //       }
    //     });
    //      $('#nameOne').html(playerName);
    //   }
    // });


// $('#startButton').on('click', function(){
//   var name = $('#employeeName').val().trim();
//   var role = $('#role').val().trim();
//   var startDate = $('#datepicker').val().trim();
//   var monthlyRate = parseInt($('#monthlyRate').val());

//   console.log(name, role, startDate, monthlyRate);

//   database.ref().push({
//     name: name,
//     role: role,
//     startDate: startDate,
//     monthlyRate: monthlyRate,
//     created: firebase.database.ServerValue.TIMESTAMP,
//     modified: firebase.database.ServerValue.TIMESTAMP

//   });
//   $('input').val("");


// ======= Pseudo Code ==============

// 1. Layout of the game (use bootstrap)
// JOSE said to build it and get it working locally
// 2. Build out firebase and capture data
	// Start with connect/disconnect function
		// .push() auto assigns/generates an id
	// Chat function
	 // User name and id
	// Chat box
// 3. Write the game play 

// .info/connected
// https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

// be careful with the timout function. When using the snapshot function it runs on an infinite loop 
// so you need to pause




