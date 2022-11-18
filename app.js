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
		// Chapter: Decoding incoming messages
		const decodeData = (data) => {
			const datalength = data[1] & 127; //Note: Anding with 127 to get the data length
			let indexFirstMask = 2;
			if (datalength === 126) {
				indexFirstMask = 4;
			} else if (datalength === 127) {
				indexFirstMask = 10;
			}

			const masks = data.slice(indexFirstMask, indexFirstMask + 4);
			let i = indexFirstMask + 4; // Note: +4 because two bytes are the seperator between the mask and the data
			let index = 0;
			let output = "";
			while (i < data.length) {
				output += String.fromCharCode(data[i++] ^ masks[index++ % 4]);
			}
			return output;
		};
		const decodedData = decodeData(data);

		// Chapter: Encoding outgoing messages
		const encodeWebSocket = (data) => {
			const bytesFormatted = new Array();
			bytesFormatted[0] = 129;
			if (data.length <= 125) {
				bytesFormatted[1] = data.length;
			} else if (data.length >= 126 && data.length <= 65535) {
				bytesFormatted[1] = 126;
				bytesFormatted[2] = (data.length >> 8) & 255; //Note: Shifting 8 bits to the right to get the first byte of the two bytes (two bytes because the length is between 126 and 65535)
				bytesFormatted[3] = data.length & 255;
			} else {
				bytesFormatted[1] = 127;
				bytesFormatted[2] = (data.length >> 56) & 255;
				bytesFormatted[3] = (data.length >> 48) & 255;
				bytesFormatted[4] = (data.length >> 40) & 255;
				bytesFormatted[5] = (data.length >> 32) & 255;
				bytesFormatted[6] = (data.length >> 24) & 255;
				bytesFormatted[7] = (data.length >> 16) & 255;
				bytesFormatted[8] = (data.length >> 8) & 255;
				bytesFormatted[9] = data.length & 255;
			}
			for (let i = 0; i < data.length; i++) {
				bytesFormatted.push(data.charCodeAt(i));
			}

			return Buffer.from(bytesFormatted);
		};

		const encodedData = encodeWebSocket("> " + decodedData);
		socket.write(encodedData);
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
