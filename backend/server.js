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

    // Handle the get_random_user event
    socket.on("get_random_user", (id) => {
        console.log("Server received get_random_user event")
        console.log("ID for the caller:", id)
        let randomUser = getRandomUser(id);
        if (randomUser) {
            // Decide who is the caller and who is the callee
            let isInitiator = Math.random() < 0.5;

            // Send back the random user and who will be the initiator
            console.log("Sending to ", id, "random user:", randomUser, "isInitiator:", isInitiator)
            console.log("Sending to random user:", randomUser, "id:", id, "isInitiator:", !isInitiator)
            io.to(id).emit("random_user", { id: randomUser, isInitiator: isInitiator });
            io.to(randomUser).emit("random_user", { id: id, isInitiator: !isInitiator });
        }
    });

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("call", { signal: data.signalData, from: data.from });
    });

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });
});

function getRandomUser(excludeId) {
    let availableUsers = Object.keys(users).filter(key => users[key] === true && key !== excludeId);
    if (availableUsers.length > 0) {
        let randomIndex = Math.floor(Math.random() * availableUsers.length);
        console.log("Random user:", availableUsers[randomIndex]);
        return availableUsers[randomIndex];
    }
    return null;
}

server.listen(5000, () => console.log('server is running on port 5000'));

