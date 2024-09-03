var song;
var user_agree;

// Function to fetch the access token from the server
async function fetchAccessToken() {
    const response = await fetch('https://server-m4vzs4tcza-ts.a.run.app/spotify-token');
    const data = await response.json();
    return data.access_token;
}
// Function to search Spotify
async function searchSpotify(token, query) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    return data['tracks']['items'];  // Adjust this based on the API response structure
}

async function selectSong(token,song) {

    const response = await fetch(`https://api.spotify.com/v1/audio-features/${song}`,
        { headers: {
            'Authorization': 'Bearer ' + token
            }
    });
    const data = await response.json();
    // console.log("received data: " + data);
    return data;
}
function populateDropdown(tracks) {

    const dropdown = document.getElementById('dropdown');

    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
      }
      
    dropdown.innerHTML = '';
    dropdown.style.display = 'block';

    tracks.forEach(track => {
        const item = document.createElement('div');
        const link = document.createElement('a');
        link.href = `${window.location.href.split('?')[0]}?${track.id}`;
        link.classList.add('link-item')
        link.appendChild(item);
        item.classList.add('dropdown-item');
        const songLength = millisToMinutesAndSeconds(track.duration_ms);
        item.innerHTML = `
            <img src="${track.album.images[0].url}" alt="${track.name}" class="track-img">
            <div class="track-details">
                <div class="track-name">${track.name}</div>
                <div class="artist-name">${track.artists.map(artist => artist.name).join(', ')}</div>
            </div>
            <div class="track-time">${songLength}</div>
        `;

        dropdown.appendChild(link);
    });
}
function showcaseState(song,state){
//show the image, song name, artist and audio features, as well as the final state
    const analysis = document.createElement('div');
    const showResults = document.getElementById('analysis');
    const tempo = Math.round(song.tempo);
    const energy = Math.round(song.energy*100);
    const danceability  = Math.round(song.danceability *100);
    const instrumentalness = Math.round(song.instrumentalness*100);
    const acousticness = Math.round(song.acousticness*100);
    const liveness = Math.round(song.liveness*100);
    const speechiness = Math.round(song.speechiness*100);
    analysis.innerHTML = `
            <div class="state">
                <h2> This is a <span class="highlighted-state">${state.state}</span> song </h2>
                <p class="state-desc"> ${state.desc} </p>
                <div id='feedback' class="button-horiz">
                    <button role="button" id="agree" onclick='agreeFunction()' class="agree-buttons">I agree</button>
                    <button role="button" id="disagree" onclick='disagreeFunction()' class="agree-buttons">I disagree</button>
                    </div>
            </div>
            <div class="details-wrapper">
                    <h3 id="artist" class="song-name">${song.artists}</h2>
                    <h2 id="song_name" class="song-name">${song.name}</h2>
                <div class="analysis-details">
                    <img class="analysis-img" src="${song.img}" alt="${song.name}" >
                    <div class="audio-progress-wrapper">
                        <h4 id="tempo" class="audio-feature-name"> Tempo: ${tempo}bpm </h4>
                        <div class="w3-progress-container w3-round-xlarge">
                            <div class="w3-progressbar w3-round-xlarge" style="width:${tempo/250*100}%"></div>
                        </div>
                        <h4 id="energy" class="audio-feature-name"> Energy: ${energy}</h4>
                        <div class="w3-progress-container w3-round-xlarge">
                            <div class="w3-progressbar w3-round-xlarge" style="width:${energy}%"></div>
                            </div>
                            <h4 id="dance" class="audio-feature-name"> Danceability: ${danceability}</h4>
                        <div class="w3-progress-container w3-round-xlarge">
                            <div class="w3-progressbar w3-round-xlarge" style="width:${danceability}%"></div>
                        </div>
                        <h4 id="instrumental" class="audio-feature-name"> Instrumentalness: ${instrumentalness}</h4>
                        <div class="w3-progress-container w3-round-xlarge">
                            <div class="w3-progressbar w3-round-xlarge" style="width:${instrumentalness}%"></div>
                        </div>
                        <h4 id="liveness" class="audio-feature-name"> Liveness: ${liveness} </h4>
                        <div class="w3-progress-container w3-round-xlarge">
                            <div class="w3-progressbar w3-round-xlarge" style="width:${liveness}%"></div>
                        </div>
                        <h4 id="acoustic" class="audio-feature-name"> Acousticness: ${acousticness}</h4>
                        <div class="w3-progress-container w3-round-xlarge">
                            <div class="w3-progressbar w3-round-xlarge" style="width:${acousticness}%"></div>
                        </div>
                        <h4 id="speech" class="audio-feature-name"> Speechiness : ${speechiness} </h4>
                        <div class="w3-progress-container w3-round-xlarge">
                            <div class="w3-progressbar w3-round-xlarge" style="width:${speechiness}%"></div>
                        </div>
                    </div>
                </div>
            </div>`
    if (showResults.innerHTML != ''){
        showResults.innerHTML = '';
    }
    showResults.append(analysis);
}
function songSelected(song){
    
    //When Song is Clicked, hide other options, run algo, show stats and form
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = 'none';
    var songChosen = false; 
    //Algorithim characteristics
        const songStates = {
        "RECOVER": {
            "state": "Recovery/Base Run",
            "bpmRange": [0, 200], // BPM match cadence (high prio)
            "dance": [0.50, 0.85],
            "energy": [0.50, 0.85],
            "acoustic": [0, 0.10],
            "instrumental": [0, 0.40],
            "liveness": [0, 0.20],
            "speech": [0, 0.10],
            "desc": "A good recovery/base run song is a calmer, less intrusive song. Allowing you to relax and enjoy the scenery with some background music behind it."
        },
        "FALLOFF": {
            "state": "Revival",
            "bpmRange": [0, 200], // BPM equal avg cadence, or slightly higher than current cadence (High prio)
            "happiness": [0.40, 0.90],
            "dance": [0.48, 0.80],
            "energy": [0.73, 1],
            "acoustic": [0, 0.60],
            "instrumental": [0, 0.15],
            "liveness": [0.05, 0.30],
            "speech": [0, 0.20],
            "desc": "You've hit the wall. There's no more fuel in the tank... or is there? A good revival song is there to bring you back from the dead, inspiring you to greatness through uplifting lyrics or high intensity music. These songs have one message. DON'T GIVE UP!"
        },
        "COOLDOWN": {
            "state": "Cooldown Run",
            "bpmRange": [0, 200], // BPM lower than current cadence (low prio)
            "dance": [0.45, 0.55],
            "energy": [0.60, 0.80],
            "acoustic": [0, 0.80],
            "instrumental": [0, 0.20],
            "liveness": [0, 0.25],
            "speech": [0, 0.50],
            "desc": "Similar to a recovery run song, a cooldown song is best near the end or after a big run to truly emphasise what you've done. Well done"

        },
        "RACE": {
            "state": "Race Run",
            "bpmRange": [100, 200], // BPM match ideal cadence ~175-180bpm (High prio)
            "dance": [0.05, 0.80],
            "energy": [0.82, 1.00],
            "acoustic": [0, 0.10],
            "instrumental": [0, 0.10],
            "liveness": [0.05, 0.60],
            "speech": [0, 0.20],
            "desc": "A race song is the ultimate hypeman for your big race, or even for an all out sprint. Forget about zone 2, forget about ideal cadence, its time to run as fast as you possibly can."
        },
        "TEMPO": {
            "state": "Tempo Run",
            "bpmRange": [0, 1000], // BPM match cadence (High prio)
            "dance": [0.15, 0.80],
            "energy": [0.60, 1],
            "acoustic": [0, 1],
            "instrumental": [0, 1],
            "liveness": [0, 0.80],
            "speech": [0, 0.28],
            "desc": "Maintain your cadence, maintain your speed, that is what the tempo run songs are all about. High intensity, but comfortable, these songs are what will drive you to your next PB."
        },
        "WARMUP": {
            "state": "Warmup Run",
            "bpmRange": [0, 200], // BPM match cadence (low prio)
            "dance": [0.25, 0.85],
            "energy": [0.30, 1],
            "acoustic": [0, 0.80],
            "instrumental": [0, 0.50],
            "liveness": [0, 0.90],
            "speech": [0, 0.60],
            "desc":"If you're just getting started, a warmup song is exactly what you need. A less intensive song that still will motivate you and push forward until you begin hitting your stride"
        }
    };

    function inRange(value, range) {
        return value >= range[0] && value <= range[1];
    }

    for (let stateKey in songStates) {
        const state = songStates[stateKey];
        if (inRange(song.tempo, state.bpmRange) &&
            inRange(song.danceability, state.dance) &&
            inRange(song.energy, state.energy) &&
            inRange(song.acousticness, state.acoustic) &&
            inRange(song.instrumentalness, state.instrumental) &&
            inRange(song.liveness, state.liveness) &&
            inRange(song.speechiness, state.speech)
        ) {
            // Categorize the song to its state
            songChosen = true;
            // console.log("State chosen: " + state.state);
            return state; // Return the matched state
        }
    }

    // If no state is matched
        var noState =  {
            "state": "Broken",
            "desc":"This song didn't match any of the possible criterias for running... Maybe for good reason? Or probably because my algorithm is broken. Either way, let me know what type of song this should be by clicking 'I disagree' or if this is just a straight up bad song to run to or if you want to be funny, click 'I agree'"
            };
    if (!songChosen) {
        // console.log("Song does not match any state criteria");
        return noState;
    }


}

async function getData(){
    var url = 'https://sql-453730682128.asia-southeast1.run.app';
    response = await fetch(`${url}/read/${song.id}`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        }});
    const data = await response.json();
    console.log(`got the data ${data}`);
    return data; 
}
async function submitPost(){
   
    const agreeBox = document.createElement('div');
    const feedback = document.getElementById('feedback');
    agreeBox.innerHTML= `
        <div class="agreebox">
            <p> Thanks for the feedback! </p> 
        </div>
    `;
    //post song data and agree to db 
    const current_state = document.getElementsByClassName("highlighted-state")[0].innerText;
    const artist = document.getElementById('artist').innerText;
    const dance = document.getElementById('dance').innerText.split(': ').pop();
    const song_name = document.getElementById('song_name').innerText.split(': ').pop();
    const energy = document.getElementById('energy').innerText.split(': ').pop();
    const acoustic = document.getElementById('acoustic').innerText.split(': ').pop();
    const instrumental = document.getElementById('instrumental').innerText.split(': ').pop();
    const liveness = document.getElementById('liveness').innerText.split(': ').pop();
    const speech = document.getElementById('speech').innerText.split(': ').pop();
    var new_state = current_state;
    if (user_agree == false){
        new_state = document.getElementById('new_state').value ;
    }
    var url = 'https://sql-453730682128.asia-southeast1.run.app';
    response = await fetch(`${url}/add`,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({

            "spotify_id": song.id,  // Replace with actual data
            "song_name": song_name, // Replace with actual data
            "artist": artist,
            "current_state": current_state,
            "user_agree": user_agree, // Replace with actual data or user input
            "new_state": new_state,
            "tempo": song.tempo,
            "dance": dance,
            "energy": energy,
            "acoustic": acoustic,
            "instrumental": instrumental,
            "liveness": liveness,
            "speech": speech 
        })
    });
    feedback.innerHTML='';
    feedback.append(agreeBox);
}
function agreeFunction(){
    user_agree = true;
    submitPost();
}
function disagreeFunction(){
    const disagreeBox = document.createElement('div');
    const feedback = document.getElementById('feedback');
    feedback.innerHTML='';
    user_agree = false;
    disagreeBox.innerHTML = `
        <div class="disagreebox"> 
        <p> What type of running should this song be for? </p>
        <select id="new_state" class="dis-dropdown">
            <option id="warmup">Warmup </option>
            <option id="recovery">Recovery/Base </option>
            <option id="tempo">Tempo </option>
            <option id="revival">Revival </option>
            <option id="race">Race </option>
            <option id="cooldown">Cooldown </option>
        </select>
        <button onclick="submitPost()" class="submit-button" type="submit"> Confirm </button>
        </div>
    `
    feedback.append(disagreeBox);
}

// Main function to handle the workflow
var searchlist='null';
var state = 'null';
async function main() {
    try {
        const token = await fetchAccessToken();
        // console.log(`token: ${token}`);
        const searchButton = document.getElementById('input-search');
        const dropdown = document.getElementById('dropdown');

        searchButton.addEventListener('keydown', async () => {
            const query = document.getElementById('input-search').value;
            if (query.length > 0) {
                const results = await searchSpotify(token, query);
                populateDropdown(results);
                searchlist =Array.from(document.getElementsByClassName('link-item'));
                if (searchlist !='null'){
                searchlist.forEach(function(link){
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    console.log("Song chosen.");
                    song =link.href.split('?').pop();
                    selectSong(token, song).then(data => {
                        if (data) {
                            state = songSelected(data); // Proceed only if data is successfully fetched
                            //get current track selected details
                            const track = {};  // Create an object to hold track details
                            const trackNameElement = link.getElementsByClassName("track-name")[0];
                            const trackArtistsElement = link.getElementsByClassName("artist-name")[0];
                            const trackImgElement = link.getElementsByClassName("track-img")[0];
                            const trackSongLengthElement = link.getElementsByClassName("track-time")[0];
                           
                            song = data;
                            track.tempo =data.tempo;
                            track.danceability =data.danceability;
                            track.energy = data.energy;
                            track.acousticness = data.acousticness;
                            track.instrumentalness = data.instrumentalness
                            track.liveness = data.liveness;
                            track.speechiness = data.speechiness;
                            // Set track object properties
                            track.name = trackNameElement ? trackNameElement.textContent : '';
                            track.artists = trackArtistsElement ? trackArtistsElement.textContent : '';
                            track.img = trackImgElement ? trackImgElement.src : '';  // Assuming it’s an <img> element
                            track.songLength = trackSongLengthElement ? trackSongLengthElement.textContent : '';
                
                            showcaseState(track,state);

                            // agree = document.getElementById('agree');
                            // disagree = document.getElementById('disagree');
                            // agree.addEventListener('click',agreeFunction());
                            // disagree.addEventListener('click',disagreeFunction());
                        } else {
                            console.log("No data received or error occurred.");
                        }
                        });

                });
                });}
                }
                else {
                    dropdown.style.display = 'none';
                    searchlist = 'null';
                }
            });
    } catch (error) {
        console.error('Error fetching data:', error);
        // document.getElementById('dropdown').innerText = 'Error fetching data. Please try again later.';
        }
    
    //listener for when a song is selected
}

// Run the main function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', main);
