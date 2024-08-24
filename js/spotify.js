

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
    console.log("received data: " + data);
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
    analysis.innerHTML = `
            <div class="state">
                <h2> This is a ${state.state} song </h2>
                <p class="state-desc"> ${state.desc} </p>
                <div class="button-horiz">
                    <button class="agree-buttons">Agree?</button>
                    <button class="agree-buttons">No way</button>

                    </div>
            </div>
            <img src="${song.img}" alt="${song.name}" class="analysis-img">
            <div class="analysis-details">
                <div class="track-name">${song.name}</div>
                <div class="artist-name">${song.artists}</div>
            </div>`
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
            "state": "Falling Off",
            "bpmRange": [0, 200], // BPM equal avg cadence, or slightly higher than current cadence (High prio)
            "happiness": [0.40, 0.90],
            "dance": [0.48, 0.80],
            "energy": [0.73, 1],
            "acoustic": [0, 0.60],
            "instrumental": [0, 0.15],
            "liveness": [0.05, 0.30],
            "speech": [0, 0.20],
            "desc": "You've hit the wall. There's no more fuel in the tank... or is there? A good falloff song is there to bring you back from the dead, inspiring you to greatness through uplifting lyrics or high intensity music. These songs have one message. DON'T GIVE UP!"
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
            console.log("State chosen: " + state.state);
            return state; // Return the matched state
        }
    }

    // If no state is matched
    if (!songChosen) {
        console.log("Song does not match any state criteria");
        return "UNIDENTIFIED";
    }


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
                    var song =link.href.split('?').pop();
                    selectSong(token, song).then(data => {
                        if (data) {
                            state = songSelected(data); // Proceed only if data is successfully fetched
                            //get current track selected details
                            const track = {};  // Create an object to hold track details
                            const trackNameElement = link.getElementsByClassName("track-name")[0];
                            const trackArtistsElement = link.getElementsByClassName("artist-name")[0];
                            const trackImgElement = link.getElementsByClassName("track-img")[0];
                            const trackSongLengthElement = link.getElementsByClassName("track-time")[0];

                            // Set track object properties
                            track.name = trackNameElement ? trackNameElement.textContent : '';
                            track.artists = trackArtistsElement ? trackArtistsElement.textContent : '';
                            track.img = trackImgElement ? trackImgElement.src : '';  // Assuming it’s an <img> element
                            track.songLength = trackSongLengthElement ? trackSongLengthElement.textContent : '';
                
                            showcaseState(track,state);

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
