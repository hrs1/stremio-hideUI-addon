const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

const PORT = process.env.PORT || 10000;

serveHTTP(addonInterface, {
    port: PORT,
    host: "0.0.0.0"
});

console.log("Addon running on port:", PORT);