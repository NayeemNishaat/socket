const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Segment: Create Server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        // origin: "http://127.0.0.1:8080" // Point: The allowed origin
        origin: "*"
    }
});

// Segment: Socket
// Part: Sending Global Events
function sendTime() {
    io.emit("time", { time: new Date().toJSON() });
}
setInterval(sendTime, 100000);

// Part: Listening Global "connection" Event and Responsing to Client
io.on("connection", function (socket) {
    // Key: Sending Local Events to Client
    socket.emit("welcome", { message: "Welcome!", id: socket.id });

    // Part: Listening for Local Events from Client
    socket.on("client", console.log); // Note: console.log is a callback function/method here that will be called by socket with the received parameter!

    // Key: Listening Local Events
    socket.on("delete", () => {
        // Key: Sending Global Events to Clients
        io.emit("deleted", "Deleted Successfully");
    });
});

httpServer.listen(3001);
