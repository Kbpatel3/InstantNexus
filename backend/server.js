const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();

// SSL certificate and key
const privateKey = fs.readFileSync('../server.key', 'utf8');
const certificate = fs.readFileSync('../server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
const server = https.createServer(credentials, app);

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Add a default route
app.get('/', (req, res) => {
    res.send('Server is running.');
});


// Keep track of all users in a dictionary with key being the id and value being whether they are available to connect
let users = {};

// Create a socket connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Add the user to the list of users with no availability to connect and not in a call
    users[socket.id] = { availability: false, inCall: false };

    // Get the user's id
    socket.emit("my_id", socket.id);

    // Debugging: Print the list of users
    console.log(users);

    // Handle the disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        handleDisconnect(socket.id);

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
        if (users[id]) {
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

                // Set the availability of the users to false
                users[id].availability = false;
                users[randomUser].availability = false;
            }
        }
    });

    socket.on("is_available", (id) => {
        if (users[id]) {
            users[id].availability = true;
        }
    });

    socket.on("is_not_available", (id) => {
        if (users[id]) {
            users[id].availability = false;
        }
    });

    // Handle the signal event
    socket.on("signal", ({ userToSignal, signal }) => {
        // Forward the signal to the user to signal
        if (users[userToSignal]) {
            io.to(userToSignal).emit("signal", { signal, from: socket.id });
        }
    });

    // Handle the call_ended event
    socket.on("call_ended", ({ id, userToNotify }) => {
        if (users[id]) {
            console.log("Call ended by:", id);
            users[id].inCall = false;
            users[id].availability = false;
        }

        if (users[userToNotify]) {
            console.log("Notifying:", userToNotify);
            users[userToNotify].inCall = false;
            users[userToNotify].availability = true;
            io.to(userToNotify).emit("call_ended_notification", "Partner stopped the call." +
                " Searching for the next match.");
        }
    });

    socket.on("call_connected", ({ id, otherId }) => {
        // Setup a chat room for the two users
        let roomId = id + "-" + otherId;
        messages[roomId] = [];
        console.log("Chat room created:", roomId);

        // Notify the users that the call has connected and to join the chat room (roomId)
        io.to(id).emit("call_connected", roomId);
        io.to(otherId).emit("call_connected", roomId);
    });
});

function handleDisconnect(userId) {
    if (users[userId] && users[userId].inCall) {
        let userToNotify = getConnectedUser(userId);

        if (userToNotify) {
            console.log("Notifying disconnected user's partner:", userToNotify);
            users[userToNotify].inCall = false;
            users[userToNotify].availability = true;
            io.to(userToNotify).emit("call_ended_notification", "Partner disconnected." +
                " Searching for the next match.");
        }
    }
}

function getConnectedUser(exludeId) {
    return Object.keys(users).find(id => users[id].inCall && id !== exludeId);
}

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

server.listen(5000, '0.0.0.0', () => console.log('server is running on port 5000'));
