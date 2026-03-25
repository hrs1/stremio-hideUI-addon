const { serveHTTP, publishToCentral } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

console.log("🔥 server.js starting...");

const PORT = process.env.PORT || 10000;

serveHTTP(addonInterface, {
    port: PORT,
    host: "0.0.0.0"
});
publishToCentral('https://stremio-hideui-addon.onrender.com//manifest.json');

console.log("✅ Listening on port:", PORT);
