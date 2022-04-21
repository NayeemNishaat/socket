import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
// import { io } from "socket.io-client"; // Note: Only works with a bundler.
const socket = io("http://127.0.0.1:3001/"); // Remark: For different Domain
// const socket = io(); // Remark: For Same Domain

// Segment: DOM Elemenets
const btn = document.querySelector("button");
const pmEl = document.getElementById("pm");
const messages = document.querySelector("ul");
const nameEl = document.getElementById("name");
const paragraphEl = document.querySelector("p");

// Segment: DOM Operations
function sendMessage(message, renderEl = messages) {
	const text = document.createTextNode(message);
	const el = document.createElement("li");

	el.appendChild(text);
	renderEl.appendChild(el);
}

// Segment: Socket
let users;
let me;

// Key: Listening for Events from Server
socket.on("welcome", function (data) {
	sendMessage(data.message);

	// Key: Sending Response to Server
	socket.emit("new client", data.id);
	me = data.id;
});

// Key: Listening for Events from Server
socket.on("time", function (data) {
	sendMessage(data.time);
	users = data.users;
	// console.log(users);
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

if (pm) {
	pm.addEventListener("click", (e) => {
		e.preventDefault();

		const name = nameEl.value;
		const msg = btn.previousElementSibling.value;

		socket.emit("sendPrivate", name, msg, users.filter((u) => u !== me)[0]);
	});
}

socket.on("sent", (msg) => {
	sendMessage(msg);
});

socket.on("private", (msg) => sendMessage(msg, paragraphEl));

socket.on("error", console.error.bind(console));
socket.on("message", console.log.bind(console));
