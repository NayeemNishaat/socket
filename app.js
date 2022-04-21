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

const connected = [];

// Segment: Socket
// Part: Sending Global Events
function sendTime() {
	io.emit("time", {
		time: new Date().toJSON(),
		users: connected
	});
}
setInterval(sendTime, 10000);

// Part: Listening Global "connection" Event and Responsing to Client
io.on("connection", function (socket) {
	connected.push(socket.id);

	// Key: Sending Local Events to Client
	socket.emit("welcome", {
		message: "Welcome!",
		id: socket.id
	});

	// Part: Listening for Local Events from Client
	socket.on("new client", console.log); // Note: console.log is a callback function/method here that will be called by socket with the received parameter!

	// Key: Listening Local Events
	socket.on("send", (name, msg) => {
		// Key: Sending Global Events to All Clients
		// io.to()
		io.emit("sent", `${name}: ${msg}`);
		// Key: Sending Local Event to a Specific Client
		// socket.emit("deleted", "Deleted Successfully");
	});
});

httpServer.listen(3001);
