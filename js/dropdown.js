/* dropdown.js */
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('input-search');
    const dropdown = document.getElementById('dropdown');

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();

        if (query.length > 2) {
            fetchTracks(query);
        } else {
            dropdown.style.display = 'none';
        }
    });

    async function fetchTracks(query) {
        // Dummy data for demonstration.
        const tracks = [
            {
                img: 'https://via.placeholder.com/40',
                name: 'Song 1',
                artist: 'Artist 1',
                time: '3:30'
            },
            {
                img: 'https://via.placeholder.com/40',
                name: 'Song 2',
                artist: 'Artist 2',
                time: '4:00'
            }
        ];

        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, 500));

        populateDropdown(tracks);
    }

    function populateDropdown(tracks) {
        dropdown.innerHTML = '';
        dropdown.style.display = 'block';

        tracks.forEach(track => {
            const item = document.createElement('div');
            item.classList.add('dropdown-item');

            item.innerHTML = `
                <img src="${track.img}" alt="${track.name}" class="track-img">
                <div class="track-details">
                    <div class="track-name">${track.name}</div>
                    <div class="artist-name">${track.artist}</div>
                </div>
                <div class="track-time">${track.time}</div>
            `;

            dropdown.appendChild(item);
        });
    }
});
