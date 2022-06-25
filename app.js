const http = require("node:http");
const crypto = require("node:crypto");

const httpServer = http.createServer(function (req, res) {
	let data = "";
	req.on("data", (chunk) => {
		data += chunk;
	});

	req.on("end", () => {
		console.log(JSON.parse(data));
	});

	res.writeHead(200, { "Content-Type": "application/json" });

	res.write(JSON.stringify({ status: "success" }));
	res.end();
});

// Important: For upgrading the connection the request should have the following headers -> {Connection: Upgrade, Upgrade: websocket}
httpServer.on("upgrade", (req, socket, head) => {
	const websocketKey =
		req.headers["sec-websocket-key"] +
		`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`;

	const hashedKey = crypto
		.createHash("sha1")
		.update(websocketKey)
		.digest("base64");

	socket.write(
		"HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
			"Upgrade: WebSocket\r\n" +
			"Connection: Upgrade\r\n" +
			`Sec-WebSocket-Accept: ${hashedKey}\r\n` +
			"\r\n"
	);
	// socket.pipe(socket);
	// socket.on("data", (data) => {
	// 	console.log(Buffer.from(data).toString());
	// 	socket.emit("message", "Hello World");
	// });
	// console.log(socket);

	// req.on("upgrade", (res, socket, upgradeHead) => {
	// 	console.log("got upgraded!");
	// 	socket.end();
	// 	// process.exit(0);
	// });
});

// Remark: Simulate a http request via vanilla nodejs
// const options = {
// 	port: 1111,
// 	host: "127.0.0.1",
// 	headers: {
// 		Connection: "Upgrade",
// 		Upgrade: "websocket"
// 	}
// };
// const req = http.request(options);
// req.end();

// httpServer.on("connection", (stream) => {
// 	console.log(stream);
// });

httpServer.listen(1111, () => {
	console.log("Server started at port 1111");
});
