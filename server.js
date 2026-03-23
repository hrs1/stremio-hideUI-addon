const addonInterface = require("./addon");
const { serveHTTP } = require("stremio-addon-sdk");

const PORT = process.env.PORT || 7000;

// ✅ IMPORTANT: enable config UI
serveHTTP(addonInterface, {
    port: PORT,
    // this enables /configure endpoint
    allowOrigin: "*"
});