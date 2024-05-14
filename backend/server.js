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

    // Add the user to the list of users with no availability to connect and not in a call
    users[socket.id] = {availability: false, inCall: false};

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

    // Handle the get_random_user event
    socket.on("get_random_user", (id) => {
        // Set the availability of the user to connect to true for the caller
        users[id].availability = true;

        // Get a random user to connect to
        let randomUser = getRandomUser(id);

        // If there is a random user, send the random user and who will be the initiator
        if (randomUser) {
            // Decide who is the caller and who is the callee
            let isInitiator = Math.random() < 0.5;

            // Send back the random user and who will be the initiator
            io.to(id).emit("random_user", { id: randomUser, isInitiator: isInitiator });
            io.to(randomUser).emit("random_user", { id: id, isInitiator: !isInitiator });

            // Set the inCall status to true for both users
            users[id].inCall = true;
            users[randomUser].inCall = true;
        }
    });

    socket.on("is_available", (id) => {
        users[id].availability = true;
    });

    socket.on("is_not_available", (id) => {
        users[id].availability = false;
    });

    // Handle the send_signal event
    socket.on("send_signal", (data) => {
        io.to(data.to).emit("receive_signal", data.signal);
    });
});

function getRandomUser(excludeId) {
    // Get all the available users except the user to exclude and users who are already in a call or not available
    let availableUsers = Object.keys(users).filter(id => id !== excludeId && users[id].availability && !users[id].inCall);
    if (availableUsers.length > 0) {
        let randomIndex = Math.floor(Math.random() * availableUsers.length);
        console.log("Random user:", availableUsers[randomIndex]);
        return availableUsers[randomIndex];
    }
    return null;
}

server.listen(5000, () => console.log('server is running on port 5000'));

