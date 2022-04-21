import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
// import { io } from "socket.io-client"; // Note: Only works with a bundler.
const socket = io("http://127.0.0.1:3001/"); // Remark: For different Domain
// const socket = io(); // Remark: For Same Domain

// Segment: DOM Elemenets
const btn = document.querySelector("button");
const messages = document.querySelector("ul");
const nameEl = document.getElementById("name");

// Segment: DOM Operations
function sendMessage(message) {
	const text = document.createTextNode(message);
	const el = document.createElement("li");

	el.appendChild(text);
	messages.appendChild(el);
}

// Segment: Socket
// Key: Listening for Events from Server
socket.on("welcome", function (data) {
	sendMessage(data.message);

	// Key: Sending Response to Server
	socket.emit("new client", data.id);
});

// Key: Listening for Events from Server
socket.on("time", function (data) {
	sendMessage(data.time);
	console.log(data.users);
});

// Key: Initiating Delete Request
if (btn) {
	btn.addEventListener("click", (e) => {
		e.preventDefault();

		const name = nameEl.value;
		const msg = btn.previousElementSibling.value;

		socket.emit("send", name, msg);
	});
}

socket.on("sent", (msg) => {
	sendMessage(msg);
});

socket.on("error", console.error.bind(console));
socket.on("message", console.log.bind(console));
