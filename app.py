from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import sqlite3
import sqlitecloud
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app,resources={"/add":{"origins": "*"}})
server = f'sqlitecloud://{os.getenv("PROJECT_ID")}.sqlite.cloud'
port = os.getenv("HOST_PORT")
con_string = f'{server}:{port}?apikey={os.getenv("SQL_API_KEY")}' 
database= 'database.db'
table = 'songs'
load_dotenv()
def init_sqlite_db():
    """Initialize SQLite database and create the songs table if it does not exist."""
    conn = sqlitecloud.connect(con_string)
    app.logger.warning("Opened database successfully")

    conn.execute(f"USE DATABASE {database}")
 
 
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


        url = f'https://{server}:{port}/v2/weblite/sql'
        data  = {
            
        }
        sql = """
                INSERT INTO songs (spotify_id, song_name, artist, current_state, user_agree, 
                                new_state, tempo, dance, energy, acoustic, instrumental, liveness, speech) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """

                # Replace these with your actual data values
        data_values = (
                spotify_id, song_name, artist, current_state, user_agree, new_state, 
                tempo, dance, energy, acoustic, instrumental, liveness, speech
                )
        payload = {
            "sql": sql,
            "params": data_values
        }
        headers = {
            'accept': 'appplication/json',
            "Authorization": "Bearer "+con_string
        }
        response = requests.post(url,json=payload,headers=headers)
        if response.status_code == 200:
            app.logger.warning("data inserted successfully")
        else:
            app.logger.warning(f"error: {response.status_code}")
            app.logger.warning(response.text)


@app.route('/read/<spotify_id>', methods=['GET'])
def read_song(spotify_id):
    """Endpoint to retrieve a song based on Spotify ID."""
    url = ""
    data  = {
        
    }
    headers = {
        'Content-Type': 'appplication/json'
    }
    response = requests.get(url,data=json.dumps(data),headers=headers)
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
