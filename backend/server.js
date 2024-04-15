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

    // Add the user to the list of users
    users[socket.id] = true;

    // Debugging: Print the list of users
    console.log(users);

    // When the user disconnects, send a message to connected users
    socket.on("disconnect", () => {
        console.log('User disconnected');
        socket.broadcast.emit("callEnded");

        // Remove the user from the list of users
        delete users[socket.id];

        // Debugging: Print the list of users
        console.log(users);
    });

    // When a user is ready to connect to another user
    socket.on("callUser", (data) => {
        // Set the user to not available to connect
        users[socket.id] = false;

        // Get a random user to connect to
        let userToCall = getRandomUser(socket.id);

        // If there is a user to call, send a message to the user to connect
        if (userToCall) {
            io.to(userToCall).emit("callUser", {signal: data.signalData, from: socket.id});
        }
    });

    // When a user answers the call
    socket.on("answerCall", (data) => {
        // Set the user to not available to connect
        users[data.from] = false;
        io.to(data.to).emit("callAccepted", data.signal);
    });

    // Wait for the socket call get_user_count and send the user count
    socket.on("get_user_count", () => {
        console.log("Got request for user count");
        // Send the user count back to the requesting client only
        socket.emit("user_count", Object.keys(users).length);
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

