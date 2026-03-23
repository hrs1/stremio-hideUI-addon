const addonInterface = require("./addon");
const { serveHTTP } = require("stremio-addon-sdk");

const PORT = process.env.PORT || 10000;

// ✅ IMPORTANT: enable config UI
serveHTTP(addonInterface, {
    port: PORT,
    // this enables /configure endpoint
    host: "0.0.0.0",
    allowOrigin: "*"
});