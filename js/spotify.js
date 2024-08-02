

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

    const response = await fetch(`https://api.spotify.com/v1/audio-features?url=${song.url}`,
        { headers: {
            'Authorization': 'Bearer ' + token
            }
    });
    const data = await response.json();
    return data.audio_features;
    
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
        link.href = `/#${track.uri}`;
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
function songSelected(song){
    //When Song is Clicked, hide other options, run algo, show stats and form
    const dropdown = document.getElementById('dropdown');
    dropdown.style.display = 'none';
    
    //Algorithim characteristics
    const songchosen = false;

    var songStates = {
        "RECOVER" : {
            "state" : "Recovery/Base Run",
            "bpmRange" : [0, 200], // BPM match cadence (high prio)
            "dance" : [.50, .85],
            "energy" : [.50, .85],
            "acoustic" : [0, .10],
            "instrumental" : [0, .40],
            "liveness" : [0, .20],
            "speech" : [0, .10]
        },
        "FALLOFF" : {
            "state" : "Falling Off",
            "bpmRange" : [0, 200], // BPM equal avg cadence, or slightly higher than current cadence (High prio)
            "happiness" : [.40, .90],
            "dance" : [.48, .80],
            "energy" : [.73, 1],
            "acoustic" : [0, .60],
            "instrumental" : [0, .15],
            "liveness" : [.05, .30],
            "speech" : [0, .20]
        },
        "COOLDOWN" : {
            "state" : "Cooldown Run",
            "bpmRange" : [0, 200], // BPM lower than current cadence (low prio)
            "dance" : [.45, .55],
            "energy" : [.60, .80],
            "acoustic" : [0, .80],
            "instrumental" : [0, .20],
            "liveness" : [0, .25],
            "speech" : [0, .50]
        },
        "RACE" : {
            "state" : "Race Run",
            "bpmRange" : [100, 200], // BPM match ideal cadence ~175-180bpm (High prio)
            "dance" : [.05, .80],
            "energy" : [.82, 1.00],
            "acoustic" : [0, .10],
            "instrumental" : [0, .10],
            "liveness" : [.05, .60],
            "speech" : [0, .20]
        },
        "TEMPO" : {
            "state" : "Tempo Run",
            "bpmRange" : [0, 1000], // BPM match cadence (High prio)
            "dance" : [.15, .80],
            "energy" : [.60, 1],
            "acoustic" : [0, 1],
            "instrumental" : [0, 1],
            "liveness" : [0, .80],
            "speech" : [0, .28]
        },
        "WARMUP" : {
            "state" : "Warmup Run",
            "bpmRange" : [0, 200], // BPM match cadence (low prio)
            "dance" : [.25, .85],
            "energy" : [.30, 1],
            "acoustic" : [0, .80],
            "instrumental" : [0, .50],
            "liveness" : [0, .90],
            "speech" : [0, .60]
        }
    };

    function inRange(value, range){
        return value >= range[0] && value <= range[1];
    }

    for (var state=0; state < songStates.size(); state++) {
        if (inRange(song.tempo, songStates.statelist.state.bpmRange) &&
            inRange(song.danceability, songStates.statelist.state.dance) &&
            inRange(song.energy, songStates.statelist.state.energy) &&
            inRange(song.acousticness, songStates.statelist.state.acoustic) &&
            inRange(song.instrumentalness, songStates.statelist.state.instrumental) &&
            inRange(song.liveness, songStates.statelist.state.liveness) &&
            inRange(song.speechiness, songStates.statelist.state.speech)
            ) {
            // categorise the song to its state
            songchosen = true;
            System.println("State chosen: " + statelist.state);
            return songStates[state];
        }    

    }
    if (songchosen == false) {
        return "UNIDENTIFIED";
    }




}


// Main function to handle the workflow
async function main() {
    var searchlist='null';
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
                searchlist =document.getElementsByClassName('link-item');
            }
            else {
                dropdown.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        // document.getElementById('dropdown').innerText = 'Error fetching data. Please try again later.';
        }
    
    //listener for when a song is selected
    try {
        
        if (searchlist !='null'){
            searchlist.forEach(function(link){
            link.addEventListener('click', function(event) {
                event.preventDefault();
                console.log("Song chosen.");
                songSelected(link.href);
            });
            });}
    }
    catch (error){
        console.error("Error loading Song data: ",error);
        document.getElementById('dropdown').innerText = 'Error loading data. Please try again later.';

    }
}

// Run the main function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', main);
