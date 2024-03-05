from flask import Flask, send_from_directory
from flask_socketio import SocketIO, join_room, leave_room, emit
import config
import os

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
app.config['SECRET_KEY'] = config.SECRET_KEY
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/')
def index():
    """
    Serve the index.html file from the frontend for the landing page.
    :return: The index.html file.
    """
    return send_from_directory(app.static_folder, 'index.html')


@socketio.on('join')
def on_join(data):
    """
    Join a room and emit a status message.
    :param data: The data from the client.
    :return: None
    """
    room = data['room']
    join_room(room)
    emit('status', {'msg': f'{data["username"]} has entered the room.'}, room=room)


@socketio.on('text')
def on_text(data):
    """
    Emit a message to the room. This is for chat messages.
    :param data: The data from the client.
    :return: None
    """
    emit('message', data, room=data['room'])


@socketio.on('leave')
def on_leave(data):
    """
    Leave the room and emit a status message.
    :param data: The data from the client.
    :return: None
    """
    leave_room(data['room'])
    emit('status', {'msg': f'{data["username"]} has left the room.'}, room=data['room'])


if __name__ == '__main__':
    socketio.run(app)
