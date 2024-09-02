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
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    spotify_id TEXT, 
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

    conn = sqlitecloud.connect(con_string)
    conn.execute(f"USE DATABASE {database}")
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
    response = conn.execute(sql,data_values)
    return response

@app.route('/read', methods=['GET'])
def read_song():
    """Endpoint to retrieve a song based on Spotify ID."""
    conn = sqlitecloud.connect(con_string)
    conn.execute(f"USE DATABASE {database}")
        
    data = conn.execute("SELECT * FROM songs AS json_result").fetchall()
    app.logger.warning(f"Read Data:  {data} ")
    return data
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
