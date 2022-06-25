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

	socket.on("data", (data) => {
		const decodeData = (data) => {
			const datalength = data[1] & 127; //Note: Anding with 127 to get the data length
			let indexFirstMask = 2;
			if (datalength === 126) {
				indexFirstMask = 4;
			} else if (datalength === 127) {
				indexFirstMask = 10;
			}

			const masks = data.slice(indexFirstMask, indexFirstMask + 4);
			let i = indexFirstMask + 4;
			let index = 0;
			let output = "";
			while (i < data.length) {
				output += String.fromCharCode(data[i++] ^ masks[index++ % 4]);
			}
			return output;
		};
		const decodedData = decodeData(data);
		console.log(decodedData);
	});
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
