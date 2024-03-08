from flask import Flask, send_from_directory
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_cors import CORS
import config
import os

# Initialize Flask
app = Flask(__name__)

# Set the secret key for the app
app.config['SECRET_KEY'] = config.SECRET_KEY

# Initialize CORS
CORS(app, resources={r'/*': {'origins': '*'}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins='*')

if __name__ == '__main__':
    socketio.run(app)
