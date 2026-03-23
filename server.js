const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

console.log("🔥 server.js starting...");

const PORT = process.env.PORT || 10000;

serveHTTP(addonInterface, {
    port: PORT,
    host: "0.0.0.0"
});

console.log("✅ Listening on port:", PORT);