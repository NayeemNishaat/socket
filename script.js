import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
// import { io } from "socket.io-client"; // Note: Only works with a bundler.
const socket = io("http://127.0.0.1:3001/"); // Remark: For different Domain
// const socket = io(); // Remark: For Same Domain

// Segment: DOM Elemenets
const btn1 = document.getElementById("btn--1");

// Segment: DOM Operations
function addMessage(message) {
    const text = document.createTextNode(message),
        el = document.createElement("li"),
        messages = document.getElementById("messages");

    el.appendChild(text);
    messages.appendChild(el);
}

// Segment: Socket
// Key: Listening for Events from Server
socket.on("welcome", function (data) {
    addMessage(data.message);

    // Key: Sending Response to Server
    socket.emit("new client", data.id);
});

// Key: Listening for Events from Server
socket.on("time", function (data) {
    addMessage(data.time);
});

// Key: Initiating Delete Request
if (btn1) {
    btn1.addEventListener("click", () => {
        socket.emit("delete");
    });
}

socket.on("deleted", (msg) => {
    btn1.previousElementSibling?.remove();
    addMessage(msg);
});

socket.on("error", console.error.bind(console));
socket.on("message", console.log.bind(console));
