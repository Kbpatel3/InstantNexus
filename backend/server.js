const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

// Keep track of all users in a dictionary with key being the id and value being whether they are available to connect
let users = {};


// Create a socket connection
io.on('connection', (socket) => {
    console.log('User connected');

    // Get the user's id
    socket.emit("my_id", socket.id);

    // Add the user to the list of users with no availability to connect
    users[socket.id] = false;

    // Debugging: Print the list of users
    console.log(users);

    // Handle the disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');

        // Remove the user from the list of users
        delete users[socket.id];

        // Debugging: Print the list of users
        console.log(users);
    });

    // Handle the get_user_count event
    socket.on("get_user_count", () => {
        let count = Object.keys(users).length;
        io.emit("user_count", count);
    });

    // Handle the start event
    socket.on('start', () => {
        console.log("User " + socket.id + " started the call");

        // Set the user's availability to connect to true
        users[socket.id] = true;

        // Get a random user to connect to
        let peerId = getRandomUser(socket.id);
        if (peerId) {
            // Emit the connect_to event to the calling user
            socket.emit('connect_to', { peerId: peerId });

            // Emit the incoming_call event to the peerId
            io.to(peerId).emit('incoming_call', { callerId: socket.id });
        }
    });

    // Handle the stop event
    socket.on('stop', (peerId) => {
        console.log("User " + socket.id + " stopped the call");

        // Set the user's availability to connect to false
        users[socket.id] = false;

        // Emit to the peerId the stop event
        io.to(peerId).emit('stopCall');

    });

    // Handle the skip event
    socket.on('skip', (peerId) => {
        console.log("User " + socket.id + " skipped the call");

        // Set the user's availability to connect to true
        users[socket.id] = true;

        // Emit to the peerId the stop event
        io.to(peerId).emit('stopCall');

        // Get a random user to connect to
        let newPeerId = getRandomUser(socket.id);
        if (newPeerId) {
            // Emit the connect_to event to the calling user
            socket.emit('connect_to', { peerId: newPeerId });

            // Emit the incoming_call event to the peerId
            io.to(newPeerId).emit('incoming_call', { callerId: socket.id });
        }
    });

    // Handle the offer event
    socket.on('offer', (peerId, data) => {
        console.log("Received offer from " + socket.id + " to " + peerId);

        // Relay the offer to the peerId
        io.to(peerId).emit('offer', data);
    })

    // Handle the answer event
    socket.on('answer', (peerId, data) => {
        console.log("Received answer from " + socket.id + " to " + peerId);

        // Relay the answer to the peerId
        io.to(peerId).emit('answer', data);
    })
});

function getRandomUser(excludeId) {
    let availableUsers = Object.keys(users).filter(key => users[key] === true && key !== excludeId);
    if (availableUsers.length > 0) {
        let randomIndex = Math.floor(Math.random() * availableUsers.length);
        return availableUsers[randomIndex];
    }
    return null;
}

server.listen(5000, () => console.log('server is running on port 5000'));

