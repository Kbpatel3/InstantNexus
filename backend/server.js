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


// Create a socket connection
io.on('connection', (socket) => {
    console.log('User connected');

    // Get the user's id
    socket.emit("my_id", socket.id);

    // When the user disconnects, send a message to connected users
    socket.on("disconnect", () => {
        console.log('User disconnected');
        socket.broadcast.emit("callEnded");
    });

    // When a user is ready to connect to another user
    socket.on("connectToUser", (data) => {
        io.to(data.userToCall).emit("connectToUser", {signal: data.signalData, from: data.from, name: data.name});
    });

    socket.on("answerConnectToUser", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });
});

server.listen(5000, () => console.log('server is running on port 5000'));

