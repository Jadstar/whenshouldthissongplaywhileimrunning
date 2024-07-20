// Function to fetch the access token from the server
async function fetchAccessToken() {
    const response = await fetch('/spotify-token');
    const data = await response.json();
    return data.access_token;
}
// Function to search Spotify
async function searchSpotify(token, query) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album,playlist`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    return data;  // Adjust this based on the API response structure
}

// Function to display search results on the webpage
function displaySearchResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';  // Clear any existing content

    if (results.tracks && results.tracks.items.length > 0) {
        const tracksHeader = document.createElement('h2');
        tracksHeader.textContent = 'Tracks';
        resultsDiv.appendChild(tracksHeader);
        results.tracks.items.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
            resultsDiv.appendChild(trackElement);
        });
    }

    if (results.artists && results.artists.items.length > 0) {
        const artistsHeader = document.createElement('h2');
        artistsHeader.textContent = 'Artists';
        resultsDiv.appendChild(artistsHeader);
        results.artists.items.forEach(artist => {
            const artistElement = document.createElement('div');
            artistElement.textContent = artist.name;
            resultsDiv.appendChild(artistElement);
        });
    }

    if (results.albums && results.albums.items.length > 0) {
        const albumsHeader = document.createElement('h2');
        albumsHeader.textContent = 'Albums';
        resultsDiv.appendChild(albumsHeader);
        results.albums.items.forEach(album => {
            const albumElement = document.createElement('div');
            albumElement.textContent = album.name;
            resultsDiv.appendChild(albumElement);
        });
    }

    if (results.playlists && results.playlists.items.length > 0) {
        const playlistsHeader = document.createElement('h2');
        playlistsHeader.textContent = 'Playlists';
        resultsDiv.appendChild(playlistsHeader);
        results.playlists.items.forEach(playlist => {
            const playlistElement = document.createElement('div');
            playlistElement.textContent = playlist.name;
            resultsDiv.appendChild(playlistElement);
        });
    }
}

// Main function to handle the workflow
async function main() {
    try {
        const token = await fetchAccessToken();
        console.log(`token: ${token}`);
        const searchButton = document.getElementById('search-button');
        searchButton.addEventListener('click', async () => {
            const query = document.getElementById('search-input').value;
            if (query) {
                const results = await searchSpotify(token, query);
                displaySearchResults(results);
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('results').innerText = 'Error fetching data. Please try again later.';
    }
}

// Run the main function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', main);
