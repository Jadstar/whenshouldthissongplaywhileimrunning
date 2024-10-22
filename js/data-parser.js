
function agreeFunction(){
const agreeBox = document.createElement('div');
agreeBox.innerHTML= `
    <div class="agreebox">
        <p class="buttonp"> Thanks for the feedback! </p> 
    </div>
`;
//post song data and agree to db 

}
function disagreeFunction(){
const disagreeBox = document.createElement('div');
const feedback = document.getElementById('feedback');
const current_state = document.getElementsByClassName("highlighted-state");
 const user_agree = document.getElementById('user_agree').value;
  const tempo = document.getElementById('tempo').value;
  const dance = document.getElementById('dance').value;
  const energy = document.getElementById('energy').value;
  const acoustic = document.getElementById('acoustic').value;
  const instrumental = document.getElementById('instrumental').value;
  const liveness = document.getElementById('liveness').value;
  const speech = document.getElementById('speech').value;
disagreeBox.innerHTML = `
    <div class="disagreebox"> 
    <form action="scripts/sql.py">

    <select id="new_state" class="dis-dropdown">
        <option id="warmup">Warmup </option>
        <option id="recovery">"Recovery/Base </option>
        <option id="tempo">"Tempo </option>
        <option id="revival">"Revival </option>
        <option id="race">"Race </option>
        <option id="cooldown">"Cooldown </option>
    </select>

    <input type="hidden" name="spotify_id" value="${spotify_id}">
    <input type="hidden" name="song_name" value="${song_name}">
    <input type="hidden" name="artist" value="${artist}">
    <input type="hidden" name="current_state" value="${current_state}">
    <input type="hidden" name="user_agree" value="${user_agree}">
    <input type="hidden" name="tempo" value="${tempo}">
    <input type="hidden" name="dance" value="${dance}">
    <input type="hidden" name="energy" value="${energy}">
    <input type="hidden" name="acoustic" value="${acoustic}">
    <input type="hidden" name="instrumental" value="${instrumental}">
    <input type="hidden" name="liveness" value="${liveness}">
    <input type="hidden" name="speech" value="${speech}">
    </form>
    </div>
`
feedback.append(disagreeBox);
}

function sendData(){




}




function main(){
agree = document.getElementById('agree');
disagree = document.getElementById('disagree');
agree.addEventListener('click',agreeFunction());
disagree.addEventListener('click',disagreeFunction());

$(document).ready(function() {
   $("#myCarousel").swiperight(function() {
      $(this).carousel('prev');
    });
   $("#myCarousel").swipeleft(function() {
      $(this).carousel('next');
   });
});
}

document.addEventListener('DOMContentLoaded', main);