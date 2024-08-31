from flask import Flask, request, jsonify
import logging
from flask_cors import CORS
import sqlite3
import sqlitecloud

app = Flask(__name__)
CORS(app,resources={"/add":{"origins": "*"}})

def init_sqlite_db():
    """Initialize SQLite database and create the songs table if it does not exist."""
    conn = sqlite3.connect('database.db')
    app.logger.warning("Opened database successfully")
    
    # Corrected CREATE TABLE statement with proper syntax
    conn.execute('''CREATE TABLE IF NOT EXISTS songs(
                    spotify_id TEXT PRIMARY KEY, 
                    song_name TEXT, 
                    artist TEXT, 
                    current_state TEXT, 
                    user_agree TEXT, 
                    new_state TEXT, 
                    tempo REAL, 
                    dance REAL, 
                    energy REAL, 
                    acoustic REAL, 
                    instrumental REAL, 
                    liveness REAL, 
                    speech REAL)''')
    app.logger.warning("Table created successfully")
    conn.close()

init_sqlite_db()

@app.route('/add', methods=['POST'])
def add_song():
    try:
        if request.method == 'POST':
            post_data= request.get_json()
            app.logger.warning(post_data)
            # Extract data from JSON payload
            # Extract data from JSON payload
            spotify_id = post_data['spotify_id']
            song_name = post_data['song_name']
            artist = post_data['artist']
            current_state = post_data['current_state']
            user_agree = post_data['user_agree']
            new_state = post_data['new_state']
            tempo = post_data['tempo']
            dance = post_data['dance']
            energy = post_data['energy']
            acoustic = post_data['acoustic']
            instrumental = post_data['instrumental']
            liveness = post_data['liveness']
            speech = post_data['speech']

            with sqlite3.connect('database.db') as con:
                cur = con.cursor()
                # Corrected INSERT statement with all columns and values
                cur.execute("""INSERT INTO songs (spotify_id, song_name, artist, current_state, user_agree, 
                            new_state, tempo, dance, energy, acoustic, instrumental, liveness, speech) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                            (spotify_id, song_name, artist, current_state, user_agree, new_state, 
                            tempo, dance, energy, acoustic, instrumental, liveness, speech))
                
                con.commit()
                msg = "Song added successfully"
    except Exception as e:
        con.rollback()
        msg = "Error occurred: " + str(e)
    finally:
        return jsonify({"message": msg})


@app.route('/read/<spotify_id>', methods=['GET'])
def read_song(spotify_id):
    """Endpoint to retrieve a song based on Spotify ID."""
    try:
        with sqlite3.connect('database.db') as con:
            con.row_factory = sqlite3.Row  # This enables column access by name: row['column_name']
            cur = con.cursor()
            cur.execute("SELECT * FROM songs WHERE spotify_id = ?", (spotify_id,))
            row = cur.fetchone()
            
            if row:
                # Convert the row to a dictionary
                song_data = {
                    "spotify_id": row["spotify_id"],
                    "song_name": row["song_name"],
                    "artist": row["artist"],
                    "current_state": row["current_state"],
                    "user_agree": row["user_agree"],
                    "new_state": row["new_state"],
                    "tempo": row["tempo"],
                    "dance": row["dance"],
                    "energy": row["energy"],
                    "acoustic": row["acoustic"],
                    "instrumental": row["instrumental"],
                    "liveness": row["liveness"],
                    "speech": row["speech"]
                }
                return jsonify(song_data)
            else:
                return jsonify({"message": "Song not found"}), 404
    except Exception as e:
        return jsonify({"message": "Error occurred: " + str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
