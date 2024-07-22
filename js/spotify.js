

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

        dropdown.appendChild(item);
    });
}


// Main function to handle the workflow
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
            }
            else {
                dropdown.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('dropdown').innerText = 'Error fetching data. Please try again later.';
    }
}

// Run the main function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', main);
