const addonInterface = require("./addon");
const { serveHTTP } = require("stremio-addon-sdk");

const PORT = process.env.PORT || 7000;

// Enables config support in URL
serveHTTP(addonInterface, { port: PORT });