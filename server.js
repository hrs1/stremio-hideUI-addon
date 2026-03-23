const http = require("http");

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    console.log("🔥 REQUEST RECEIVED:", req.method, req.url);

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Test server running on port", PORT);
});